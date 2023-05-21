import { Module } from '@nestjs/common';
import { HotService } from './hot.service';
import { HotController } from './hot.controller';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { Claim, ClaimSchema } from '../claims/schemas/claim.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SavedArticle,
  SavedArticleSchema,
} from '../saved-articles/schemas/saved-article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
  controllers: [HotController],
  providers: [HotService],
})
export class HotModule {}
