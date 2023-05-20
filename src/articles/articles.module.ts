import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schemas/article.schema';
import {
  SavedArticle,
  SavedArticleSchema,
} from '../saved-articles/schemas/saved-article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
  ],
  providers: [ArticlesService],
  controllers: [ArticlesController],
  exports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([
      { name: SavedArticle.name, schema: SavedArticleSchema },
    ]),
    ArticlesService,
  ],
})
export class ArticlesModule {}
