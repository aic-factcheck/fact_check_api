import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';

export class CreateReportDto {
  @ApiProperty({ example: 'Spam' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  @IsString()
  reason: string;

  @ApiProperty({ example: 'i report this user because...' })
  @IsOptional()
  @MinLength(0)
  @MaxLength(1028)
  @IsString()
  details: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  reportedUser: User;
}
