import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserInvitation(email: string, code: string) {
    const url = `https://factcheck.fel.cvut.cz/sign-up`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Invitation to FactCheck platform',
      template: './invitation',
      context: {
        name: email,
        url,
        code,
      },
    });
  }
}
