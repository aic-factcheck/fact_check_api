import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';

export default registerAs<AppConfig>('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.API_LOG_LEVEL || 'development',
  name: process.env.APP_NAME || 'app',
  workingDirectory: process.env.PWD || process.cwd(),
  port: parseInt(process.env.APP_PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
  extractServiceHost: process.env.EXTRACT_SERVICE_HOST || 'extract-service',
  langDetectionApiKey: process.env.DETECT_LANGUAGE_API_KEY || '',
}));
