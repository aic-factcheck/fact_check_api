import * as path from 'path';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UniqueValidator } from './common/validators/unique-validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
import { ArticlesModule } from './articles/articles.module';
import mongoConfig from './shared/config/mongo.config';
import authConfig from './shared/config/auth.config';
import appConfig from './shared/config/app.config';
import mailConfig from './shared/config/mail.config';
import redisConfig from './shared/config/redis.config';
import elasticConfig from './shared/config/elastic.config';
import { RouterModule } from '@nestjs/core';
import { SavedArticlesModule } from './saved-articles/saved-articles.module';
import { ClaimsModule } from './claims/claims.module';
import { ReviewsModule } from './reviews/reviews.module';
import { VoteModule } from './vote/vote.module';
import { HotModule } from './hot/hot.module';
import { SearchModule } from './search/search.module';
import { GameModule } from './game/game.module';
import { StatsModule } from './stats/stats.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { SharedModelsModule } from './shared/shared-models/shared-models.module';
import { InvitationsModule } from './invitations/invitations.module';
import { UniqueInvitationValidator } from './common/validators/unique-invitation.validator';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { LoggerConfigModule } from './shared/logger-config/logger-config.module';
import { I18nModule, HeaderResolver } from 'nestjs-i18n';

@Module({
  imports: [
    I18nModule.forRootAsync({
      inject: [ConfigService],
      resolvers: [new HeaderResolver(['x-custom-lang'])],
      useFactory: async (config: ConfigService) => ({
        fallbackLanguage: config.getOrThrow<string>('app.fallbackLanguage'),
        loaderOptions: {
          path: path.join(__dirname, '/common/i18n/'),
          watch: true,
        },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
          ...(configService.get<string>('app.nodeEnv') === 'production'
            ? { password: configService.getOrThrow<string>('redis.password') }
            : {}),
        },
      }),
      inject: [ConfigService],
    }),
    LoggerConfigModule,
    CacheModule.register({
      ttl: 5, // seconds
      max: 20, // maximum number of items in cache
      isGlobal: true,
    }),
    RouterModule.register([
      {
        path: 'articles',
        module: ArticlesModule,
        children: [
          {
            path: '/:articleId/claims',
            module: ClaimsModule,
            children: [
              {
                path: '/:claimId/reviews',
                module: ReviewsModule,
              },
            ],
          },
        ],
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        mongoConfig,
        mailConfig,
        redisConfig,
        elasticConfig,
      ],
      envFilePath: ['.env'],
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    ArticlesModule,
    SavedArticlesModule,
    ClaimsModule,
    ReviewsModule,
    VoteModule,
    HotModule,
    SearchModule,
    GameModule,
    StatsModule,
    ReportsModule,
    ScheduleModule.forRoot(),
    TasksModule,
    SharedModelsModule,
    InvitationsModule,
  ],
  controllers: [],
  providers: [UniqueValidator, UniqueInvitationValidator],
})
export class AppModule {}
