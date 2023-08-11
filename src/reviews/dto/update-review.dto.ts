import {
  MaxLength,
  IsString,
  IsEnum,
  IsArray,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { VoteTypes } from '../enums/vote.types';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 'This is the claim that is selected from article.' })
  @IsOptional()
  @MaxLength(512)
  @IsString()
  text?: string;

  @ApiProperty({ example: 'FALSE' })
  @IsOptional()
  @IsEnum(VoteTypes)
  vote?: VoteTypes;

  @ApiProperty({
    example: ['https://github.com/aic-factcheck', 'www.google.com'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  links?: string[];

  @ApiProperty({ example: 'en' })
  @IsOptional()
  @MaxLength(32)
  lang?: string;
}
