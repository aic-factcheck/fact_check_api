import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @MaxLength(128)
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'test123' })
  @MinLength(6)
  @MaxLength(128)
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: ['admin'] })
  @IsOptional()
  roles?: string[];
}
