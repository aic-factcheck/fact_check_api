import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplaceArticleDto {
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
