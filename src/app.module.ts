import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MovieModule } from './movie/movie.module';
import { MovieService } from './movie/movie.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    HttpModule,
    MovieModule,
    CommonModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly movieService: MovieService) {}

  async onModuleInit() {
    console.log('Fetching and persisting movies on startup...');
    await this.movieService.fetchAndPersistMovies();
  }
}
