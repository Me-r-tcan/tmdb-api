import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @ApiProperty({ description: 'Unique ID of the movie' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Name of the movie' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Overview of the movie', required: false })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiProperty({ description: 'Popularity score of the movie' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  popularity: number;

  @ApiProperty({ description: 'Average vote of the movie' })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  voteAverage: number;

  @ApiProperty({ description: 'Vote count of the movie' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  voteCount: number;

  @ApiProperty({ description: 'Release date of the movie' })
  @IsString()
  @IsNotEmpty()
  releaseDate: string;

  @ApiProperty({ description: 'Genres of the movie', type: () => [GenreDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenreDto)
  genres: GenreDto[];
}

export class GenreDto {
  @ApiProperty({ description: 'Genre ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Genre name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
