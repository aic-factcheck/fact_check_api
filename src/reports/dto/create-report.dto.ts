import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { IsObjectId } from 'class-validator-mongo-object-id';

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

  @ApiProperty({ example: '64ad235b2c3d0ba3d7373e71' })
  @IsNotEmpty()
  @IsObjectId()
  reportedUser: Types.ObjectId;
}
