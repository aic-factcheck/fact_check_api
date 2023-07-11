import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import * as morganJson from 'morgan-json';

@Module({})
export class MorganModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const format = morganJson({
      method: ':method',
      url: ':url',
      status: ':status',
      length: ':res[content-length]',
      'response-time': ':response-time',
    });

    const morganMiddleware =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production'
        ? morgan(format)
        : morgan('dev');

    consumer
      .apply(morganMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
