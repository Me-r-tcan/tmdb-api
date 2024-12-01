import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movice.dto';
import { Movie } from './schemas/movie/movie.schema';
import { GetMoviesQueryDto } from './dto/get-movies-query.dto';

@ApiTags('Movies')
@ApiExtraModels(Movie)
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @ApiOperation({ summary: 'Save a new movie' })
  @ApiResponse({
    status: 201,
    description: 'The movie has been created.',
    type: Movie,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async save(@Body() movie: CreateMovieDto): Promise<Movie> {
    return this.movieService.save(movie);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a movie by ID' })
  @ApiResponse({ status: 200, description: 'The found movie.', type: Movie })
  @ApiResponse({ status: 404, description: 'Movie not found.' })
  async findById(@Param('id') id: number): Promise<Movie> {
    return this.movieService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all movies with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of movies with pagination',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Movie) } },
        total: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: GetMoviesQueryDto,
  ): Promise<{ data: Movie[]; total: number }> {
    return this.movieService.findAll(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a movie by ID' })
  @ApiResponse({ status: 200, description: 'The deleted movie.', type: Movie })
  @ApiResponse({ status: 404, description: 'Movie not found.' })
  async removeById(@Param('id') id: number): Promise<Movie> {
    return this.movieService.removeById(id);
  }
}
