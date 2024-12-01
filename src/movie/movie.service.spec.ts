import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MovieService } from './movie.service';
import { Movie, MovieSchema } from './schemas/movie/movie.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TMDBService } from './tmdb/tmdb.service';
import { CreateMovieDto } from './dto/create-movice.dto';
import { CommonService } from '../common/common.service';
import { ConfigModule } from '@nestjs/config';

describe('MovieService', () => {
  let service: MovieService;
  let movieModel: Model<Movie>;

  const mockTMDBService = {
    discoverMovies: jest.fn(),
    getMovieDetails: jest.fn(),
  };

  const testMovie: CreateMovieDto = {
    id: 1,
    name: 'Test Movie',
    popularity: 0,
    voteAverage: 0,
    voteCount: 0,
    releaseDate: '',
    genres: [],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_TEST_URI),
        MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
      ],
      providers: [
        MovieService,
        CommonService,
        { provide: TMDBService, useValue: mockTMDBService },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieModel = module.get<Model<Movie>>(getModelToken(Movie.name));
  });

  afterAll(async () => {
    await movieModel.db.close();
  });

  afterEach(async () => {
    await movieModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new movie', async () => {
      const result = await service.save(testMovie);

      expect(result).toMatchObject(testMovie);

      const movieInDb = await movieModel.findOne({ id: testMovie.id });
      expect(movieInDb).not.toBeNull();
    });

    it('should throw ConflictException for duplicate ID', async () => {
      await service.save(testMovie);

      await expect(service.save(testMovie)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a movie by ID', async () => {
      await movieModel.create(testMovie);

      const movie = await service.findById(testMovie.id);

      expect(movie).toMatchObject({ id: testMovie.id, name: testMovie.name });
    });

    it('should throw NotFoundException if movie is not found', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeById', () => {
    it('should remove a movie by ID', async () => {
      await movieModel.create(testMovie);

      const removedMovie = await service.removeById(testMovie.id);

      expect(removedMovie).toMatchObject({
        id: testMovie.id,
        name: testMovie.name,
      });

      const movieInDb = await movieModel.findOne({ id: testMovie.id });
      expect(movieInDb).toBeNull();
    });

    it('should throw NotFoundException if movie is not found', async () => {
      await expect(service.removeById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
