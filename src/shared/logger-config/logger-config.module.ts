import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let pinoHttpOptions = {};
        const nodeEnv = configService.getOrThrow<string>('app.nodeEnv');

        if (nodeEnv === 'production') {
          pinoHttpOptions = {
            level: 'info',
          };
        } else {
          pinoHttpOptions = {
            level: 'debug',
            transport: { target: 'pino-pretty' },
            serializers: {
              req: (req) => {
                return {
                  method: req.method,
                  url: req.url,
                  parameters: req.parameters,
                };
              },
              res: (res) => {
                return {
                  statusCode: res.statusCode,
                  // payload: res.payload
                };
              },
            },
          };
        }

        return {
          pinoHttp: pinoHttpOptions,
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class LoggerConfigModule {}
