import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          pinoHttp: {
            transport:
              configService.getOrThrow<string>('app.nodeEnv') === 'development'
                ? {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      colorize: true,
                      levelFirst: false,
                      translateTime: "yyyy-MM-dd'T'HH:mm:ss.l'Z'",
                      // messageFormat:
                      //   '{req.headers.x-correlation-id} [{context}] {msg}',
                      // ignore: 'pid,hostname,context,req,res,responseTime',
                      ignore: 'res,req,pid',
                      // errorLikeObjectKeys: ['err', 'error'],
                    },
                  }
                : undefined,
          },
        };
      },
    }),
  ],
  providers: [ConfigService],
})
export class PinoLoggerModule {}
