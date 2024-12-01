import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

class Genre {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

@Schema({ timestamps: true })
export class Movie extends Document {
  @Prop({ required: true, unique: true })
  @ApiProperty()
  id: number;

  @Prop({ required: true })
  @ApiProperty()
  name: string;

  @Prop()
  @ApiProperty()
  overview: string;

  @Prop()
  @ApiProperty()
  popularity: number;

  @Prop()
  @ApiProperty()
  voteAverage: number;

  @Prop()
  @ApiProperty()
  voteCount: number;

  @Prop()
  @ApiProperty()
  releaseDate: string;

  @Prop({ type: [{ id: Number, name: String }] })
  @ApiProperty({ type: () => [Genre], description: 'List of genres' })
  genres: Genre[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
