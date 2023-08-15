import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import pinoElastic from 'pino-elasticsearch';
import { JwtPayloadType } from '../../common/types/auth/jwt-payload.type';
import { Types } from 'mongoose';

function getUserIdFromAuthHeader(authHeader: string): Types.ObjectId | null {
  if (!authHeader) return null;

  const signedToken = authHeader.split(' ')[1];
  const base64payload = signedToken.split('.')[1];
  const payloadBuffer = Buffer.from(base64payload, 'base64');
  const updatedJwtPayload = JSON.parse(
    payloadBuffer.toString(),
  ) as JwtPayloadType;
  return updatedJwtPayload._id;
}

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let pinoHttpOptions;

        if (configService.getOrThrow<string>('app.nodeEnv') !== 'production') {
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
                };
              },
            },
          };
        } else {
          const esStream = pinoElastic({
            index: 'factcheck-api-index',
            consistency: 'one',
            node: configService.getOrThrow<string>('elastic.host'),
            'es-version': 8,
            'flush-bytes': 1000,
            auth: {
              username: 'elastic',
              password: configService.getOrThrow<string>('elastic.password'),
            },
          });
          esStream.on('error', (err) => {
            console.error('Error from pino-elasticsearch:', err);
          });

          pinoHttpOptions = {
            level:
              configService.getOrThrow<string>('app.nodeEnv') !== 'production'
                ? 'debug'
                : 'info',
            transport:
              configService.getOrThrow<string>('app.nodeEnv') !== 'production'
                ? { target: 'pino-pretty' }
                : undefined,
            customAttributeKeys: {
              req: 'http.request',
              res: 'http.response',
              responseTime: 'event.duration',
            },
            messageKey: 'message',
            timestamp: () => `,"@timestamp":"${new Date().toISOString()}"`,
            serializers: {
              'http.response': (object: any) => {
                const { statusCode, ...response } = object;
                return {
                  ...response,
                  status_code: statusCode,
                };
              },
              'http.request': (object: any) => {
                const { method, url, query, headers } = object;
                const userId = getUserIdFromAuthHeader(headers.authorization);

                return {
                  method,
                  url,
                  query,
                  headers,
                  userId,
                };
              },
            },
            formatters: {
              bindings(bindings: Record<string, unknown>) {
                const {
                  // `pid` and `hostname` are default bindings, unless overriden by a `base: {...}` passed to logger creation.
                  pid,
                  hostname,
                  // name is defined if `log = pino({name: 'my name', ...})`
                  name,
                  // Warning: silently drop any "ecs" value from `base`. See "ecs.version" comment below.
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  ecs,
                  ...ecsBindings
                } = bindings;
                if (pid !== undefined) {
                  ecsBindings.process = { pid: pid }; // https://www.elastic.co/guide/en/ecs/current/ecs-process.html#field-process-pid
                }
                if (hostname !== undefined) {
                  ecsBindings.host = { hostname: hostname }; // https://www.elastic.co/guide/en/ecs/current/ecs-host.html#field-host-hostname
                }
                if (name !== undefined) {
                  ecsBindings.log = { logger: name }; // https://www.elastic.co/guide/en/ecs/current/ecs-log.html#field-log-logger
                }
                return ecsBindings;
              },
              level: (label: string) => ({ 'log.level': label }),
            },
            stream: esStream,
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
