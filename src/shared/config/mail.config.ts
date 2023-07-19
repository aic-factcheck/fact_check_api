import { registerAs } from '@nestjs/config';
import { MailConfig } from './config.type';

export default registerAs<MailConfig>('mail', () => ({
  host: process.env.EMAIL_HOST || 'smtp-relay.sendinblue.com',
  user: process.env.EMAIL_USERNAME || 'smtp-username',
  password: process.env.EMAIL_PASSWORD || 'smtp-password',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
}));
