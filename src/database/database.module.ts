import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Article, ArticleSchema } from 'src/articles/schemas/article.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.getOrThrow<string>('app.nodeEnv') === 'test'
            ? configService.getOrThrow<string>('mongo.testUri')
            : configService.getOrThrow<string>('mongo.uri'),
      }),
    }),
    MongooseModule.forFeatureAsync([
      {
        name: Article.name,
        useFactory: () => {
          const schema = ArticleSchema;
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        },
      },
    ]),
  ],
  providers: [DatabaseService, ConfigService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
