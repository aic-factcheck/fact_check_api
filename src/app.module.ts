import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UniqueValidator } from './common/validators/unique-validator';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
import { ArticlesModule } from './articles/articles.module';
import mongoConfig from './shared/config/mongo.config';
import authConfig from './shared/config/auth.config';
import appConfig from './shared/config/app.config';
import { RouterModule } from '@nestjs/core';
import { SavedArticlesModule } from './saved-articles/saved-articles.module';
import { ClaimsModule } from './claims/claims.module';
// import { PinoLoggerModule } from './common/logger/logger.module';
import { ReviewsModule } from './reviews/reviews.module';
import { VoteModule } from './vote/vote.module';
import { HotModule } from './hot/hot.module';
import { SearchModule } from './search/search.module';
import { GameModule } from './game/game.module';
import { StatsModule } from './stats/stats.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';

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
      load: [appConfig, authConfig, mongoConfig],
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
    // PinoLoggerModule,
  ],
  controllers: [],
  providers: [UniqueValidator],
})
export class AppModule {}
