import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsEnum,
  IsArray,
  IsUrl,
} from 'class-validator';
import { VoteTypes } from '../contants/vote.types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'This is the claim that is selected from article.' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(512)
  @IsString()
  text: string;

  @ApiProperty({ example: 'FALSE' })
  @IsNotEmpty()
  @IsEnum(VoteTypes)
  vote: VoteTypes;

  @ApiProperty({
    example: ['https://github.com/aic-factcheck', 'www.google.com'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsUrl({}, { each: true })
  links: string[];

  @ApiProperty({ example: 'en' })
  @IsNotEmpty()
  @MaxLength(32)
  lang: string;
}
