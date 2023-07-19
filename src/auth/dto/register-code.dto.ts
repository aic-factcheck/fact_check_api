import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  Validate,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../common/transformers/lower-case.transformer';
import { UniqueValidator } from '../../common/validators/unique-validator';

export class RegisterWithCodeDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @Validate(UniqueValidator, ['email'], {
    message: 'emailAlreadyExists',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test123' })
  @MinLength(6)
  @MaxLength(128)
  @IsString()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @MaxLength(128)
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  lastName: string;

  @ApiProperty({ example: 'A1b2C3e4' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(8)
  code: string;
}
