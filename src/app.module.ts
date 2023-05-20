import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UniqueValidator } from './utils/validators/unique-validator';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { ArticlesModule } from './articles/articles.module';
import mongoConfig from './common/config/mongo.config';
import authConfig from './common/config/auth.config';
import appConfig from './common/config/app.config';
import { RouterModule } from '@nestjs/core';
import { SavedArticlesModule } from './saved-articles/saved-articles.module';
import { ClaimsModule } from './claims/claims.module';
// import { PinoLoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'articles',
        module: ArticlesModule,
        children: [
          {
            path: '/:articleId/claims',
            module: ClaimsModule,
          },
        ],
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mongoConfig],
      envFilePath: ['.env'],
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    ArticlesModule,
    SavedArticlesModule,
    ClaimsModule,
    // PinoLoggerModule,
  ],
  controllers: [],
  providers: [UniqueValidator],
})
export class AppModule {}
