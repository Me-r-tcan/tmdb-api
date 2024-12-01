import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

export class GetMoviesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by unique movie ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Filter by movie name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by overview' })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({ description: 'Filter by lte popularity score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  'popularity.lte'?: number;

  @ApiPropertyOptional({ description: 'Filter by gte popularity score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  'popularity.gte'?: number;

  @ApiPropertyOptional({ description: 'Filter by lte average vote' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  'voteAverage.lte'?: number;

  @ApiPropertyOptional({ description: 'Filter by gte average vote' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  'voteAverage.gte'?: number;

  @ApiPropertyOptional({ description: 'Filter by lte vote count' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  'voteCount.lte'?: number;

  @ApiPropertyOptional({ description: 'Filter by gte vote count' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  'voteCount.gte'?: number;

  @ApiPropertyOptional({
    description: 'Filter by lte release date (YYYY-MM-DD)',
  })
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : null), {
    toClassOnly: true,
  })
  'releaseDate.lte'?: Date;

  @ApiPropertyOptional({
    description: 'Filter by gte release date (YYYY-MM-DD)',
  })
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) => (value ? new Date(value) : null), {
    toClassOnly: true,
  })
  'releaseDate.gte'?: Date;
}
