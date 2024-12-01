import { Module } from '@nestjs/common';
import { TMDBService } from './tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schemas/movie/movie.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    CommonModule,
  ],
  providers: [TMDBService, MovieService],
  controllers: [MovieController],
  exports: [MovieService],
})
export class MovieModule {}
