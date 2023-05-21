import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoteDto {
  @ApiProperty({ example: 'This is the claim that is selected from article.' })
  @IsNotEmpty()
  @MinLength(0)
  @MaxLength(128)
  @IsString()
  @IsOptional()
  text: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(-1)
  @Max(1)
  rating: number;
}
