import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UniqueValidator } from './utils/validators/unique-validator';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ArticlesModule } from './articles/articles.module';
import mongoConfig from './config/mongo.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, mongoConfig],
      envFilePath: ['.env'],
    }),
    AuthModule,
    UsersModule,
    DatabaseModule,
    ArticlesModule,
  ],
  controllers: [],
  providers: [UniqueValidator],
})
export class AppModule {}
