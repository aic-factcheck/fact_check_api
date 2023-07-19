import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { lowerCaseTransformer } from '../../common/transformers/lower-case.transformer';
import { UniqueInvitationValidator } from '../../common/validators/unique-invitation.validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  @Validate(UniqueInvitationValidator, ['invitedEmail'], {
    message: 'emailAlreadyInvited',
  })
  invitedEmail: string;
}
