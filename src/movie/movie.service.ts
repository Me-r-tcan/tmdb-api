import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TMDBService } from './tmdb/tmdb.service';
import { Movie } from './schemas/movie/movie.schema';
import { API_CONFIG } from './constants/constants';
import { TMDBMovie } from './interfaces/tmdb-movie.interface';
import { CreateMovieDto } from './dto/create-movice.dto';
import { GetMoviesQueryDto } from './dto/get-movies-query.dto';
import { PaginationResponse } from '../common/types/pagination-response.type';
import { CommonService } from '../common/common.service';

@Injectable()
export class MovieService {
  constructor(
    private readonly tmdbService: TMDBService,
    private readonly commonService: CommonService,
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
  ) {}

  async save(createMovieDto: CreateMovieDto): Promise<Movie> {
    try {
      const newMovie = new this.movieModel(createMovieDto);
      return await newMovie.save();
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new ConflictException(
          `A movie with ID "${createMovieDto.id}" already exists.`,
        );
      }
      throw error;
    }
  }

  async findById(id: number): Promise<Movie> {
    const movie = await this.movieModel.findOne({ id }).exec();

    if (!movie) {
      throw new NotFoundException(`Movie with ID "${id}" not found.`);
    }

    return movie;
  }

  async findAll(query: GetMoviesQueryDto): Promise<PaginationResponse<Movie>> {
    const filters = this.commonService.generateMongoFilters<GetMoviesQueryDto>(
      query,
      {
        exactFields: ['id'],
        nonExactFields: ['name', 'overview'],
      },
    );

    const { skip, limit } = this.commonService.calculatePagination(
      query.page,
      query.limit,
    );

    const [data, total] = await Promise.all([
      this.movieModel.find(filters).skip(skip).limit(limit).exec(),
      this.movieModel.countDocuments(filters).exec(),
    ]);

    return { data, total };
  }

  async removeById(id: number): Promise<Movie> {
    const movie = await this.movieModel.findOneAndDelete({ id }).exec();
    if (!movie) {
      throw new NotFoundException(`Movie with ID "${id}" not found.`);
    }
    return movie;
  }

  async fetchAndPersistMovies(): Promise<void> {
    console.log('Fetching movies from TMDB...');
    const movies = await this.tmdbService.discoverMovies();

    const existingMovieIds = new Set(
      await this.getExistingMovieIds(
        movies.map((movie: TMDBMovie) => movie.id),
      ),
    );

    const newMovies = movies.filter(
      (movie: TMDBMovie) => !existingMovieIds.has(movie.id),
    );

    console.log(`Found ${newMovies.length} new movies to persist.`);

    for (let i = 0; i < newMovies.length; i += API_CONFIG.REQUEST_LIMIT) {
      const chunk = newMovies.slice(i, i + API_CONFIG.REQUEST_LIMIT);
      await this.processChunk(chunk);
    }

    console.log('Movie fetch and persistence completed.');
  }

  private async getExistingMovieIds(movieIds: number[]): Promise<number[]> {
    const existingMovies = await this.movieModel
      .find({ id: { $in: movieIds } }, { id: 1 })
      .exec();

    return existingMovies.map((movie: Movie) => Number(movie.id));
  }

  private async processChunk(chunk: TMDBMovie[]): Promise<void> {
    const movieDetails = await Promise.all(
      chunk.map((movie: TMDBMovie) =>
        this.tmdbService.getMovieDetails(movie.id),
      ),
    );

    await this.movieModel.insertMany(
      movieDetails.map((details: TMDBMovie) => ({
        id: Number(details.id),
        name: details.title,
        overview: details.overview,
        popularity: details.popularity,
        voteAverage: details.vote_average,
        voteCount: details.vote_count,
        releaseDate: details.release_date,
        genres: details.genres,
      })),
      { ordered: false },
    );
  }
}
