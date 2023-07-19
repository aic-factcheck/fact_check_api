import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';
import { MailModule } from '../shared/mail/mail.module';

@Module({
  imports: [SharedModelsModule, MailModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
