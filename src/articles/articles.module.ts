import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schemas/article.schema';
import {
  SavedArticle,
  SavedArticleSchema,
} from './schemas/saved-article.schema';
import { SavedArticlesController } from './saved-article.controller';
import { SavedArticleService } from './saved-articles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
  providers: [ArticlesService, SavedArticleService],
  controllers: [ArticlesController, SavedArticlesController],
  exports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
})
export class ArticlesModule {}
