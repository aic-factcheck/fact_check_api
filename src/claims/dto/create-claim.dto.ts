import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  // IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClaimDto {
  @ApiProperty({ example: 'This is the claim that is selected from article.' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(512)
  @IsString()
  text: string;

  @ApiProperty({ example: 'en' })
  @IsNotEmpty()
  @MaxLength(32)
  lang: string;
}
