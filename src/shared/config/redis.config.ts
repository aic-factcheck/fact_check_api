import { registerAs } from '@nestjs/config';
import { RedisConfig } from './config.type';

export default registerAs<RedisConfig>('redis', () => ({
  host: process.env.REDIS_URI || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || 'redistest',
}));
