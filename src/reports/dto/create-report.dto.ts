import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';

export class CreateReportDto {
  @ApiProperty({ example: 'i report this user because...' })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(1028)
  @IsString()
  text: string;

  @ApiProperty({ example: 'en' })
  @IsNotEmpty()
  @IsMongoId()
  reportedUser: User;
}
