import { Module } from '@nestjs/common';
import { SavedArticlesController } from './saved-articles.controller';
import { SavedArticlesService } from './saved-articles.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SavedArticle,
  SavedArticleSchema,
} from './schemas/saved-article.schema';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
  controllers: [SavedArticlesController],
  providers: [SavedArticlesService],
  exports: [
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
})
export class SavedArticlesModule {}
