import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ example: 'Article title is about..' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(512)
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is any text of the article up to 32896 char.' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32896)
  @IsString()
  text: string;

  // @Prop({ type: [Types.ObjectId], default: [] })
  // claims: Types.ObjectId[];

  @ApiProperty({ example: ['crime', 'war'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  // @ArrayMinSize(1)
  categories: string[];

  @ApiProperty({ example: 'www.google.com' })
  @IsNotEmpty()
  @MaxLength(512)
  @IsUrl()
  sourceUrl: string;

  @ApiProperty({ example: 'article' })
  @IsNotEmpty()
  @MaxLength(64)
  sourceType: string;

  @ApiProperty({ example: 'en' })
  @IsNotEmpty()
  @MaxLength(32)
  lang: string;
}
