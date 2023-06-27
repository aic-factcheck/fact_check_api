import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { AllConfigType } from './shared/config/config.type';
import validationOptions from './common/validation-options';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // app.useLogger(app.get(Logger));
  mongoose.set(
    // setup mongoose logger for dev mode only
    'debug',
    configService.getOrThrow<string>('app.nodeEnv', { infer: true }) ===
      'development',
  );

  app.enableCors();
  app.use(helmet());
  await app.listen(
    configService.getOrThrow('app.port', { infer: true }),
    '0.0.0.0',
  );
}

bootstrap();
