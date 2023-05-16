import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsMongoId,
  IsUrl,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: '645cacbfa6693d8100b2d60a' })
  @IsNotEmpty()
  @IsMongoId()
  addedBy: Types.ObjectId;

  @ApiProperty({ example: 'Article title is about..' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(512)
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is any text of the article up to 16448 char.' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(16448)
  @IsString()
  text: string;

  // @Prop({ type: [Types.ObjectId], default: [] })
  // claims: Types.ObjectId[];

  @ApiProperty({ example: 'www.google.com' })
  @IsNotEmpty()
  @MaxLength(512)
  @IsUrl()
  sourceUrl: string;

  @ApiProperty({ example: 'article' })
  @IsNotEmpty()
  @MaxLength(64)
  sourceType: string;
}
