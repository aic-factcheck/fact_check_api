import { Model, Types } from 'mongoose';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { User } from '../users/schemas/user.schema';
import {
  SavedArticle,
  SavedArticleDocument,
} from './schemas/saved-article.schema';
import { NullableType } from '../common/types/nullable.type';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SavedArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name)
    private readonly savedArticleModel: Model<SavedArticle>,
    private readonly i18nService: I18nService,
  ) {}

  async save(user: User, articleId: Types.ObjectId): Promise<SavedArticle> {
    const articleCnt = await this.articleModel
      .findById(articleId)
      .countDocuments();
    const alreadySaved = await this.savedArticleModel
      .findOne({
        author: user._id,
        articleId,
      })
      .countDocuments();

    if (alreadySaved !== 0 || articleCnt < 1) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18nService.t('errors.save_article_failed', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    await this.articleModel.findOneAndUpdate(
      { _id: articleId },
      { $inc: { nSaved: 1 } },
    );
    const newArticle: SavedArticleDocument = new this.savedArticleModel({
      author: user._id,
      articleId,
    });
    return newArticle.save();
  }

  async findManyWithPagination(
    user: User,
    page = 1,
    perPage = 20,
  ): Promise<Article[]> {
    const savedArticles = await this.savedArticleModel
      .find({ author: user._id })
      .distinct('articleId');

    return this.articleModel
      .where('_id')
      .in(savedArticles)
      .limit(perPage)
      .skip(perPage * (page - 1));
  }

  async unsave(
    user: User,
    articleId: Types.ObjectId,
  ): Promise<NullableType<SavedArticle>> {
    await this.articleModel.findOneAndUpdate(
      { _id: articleId },
      { $inc: { nSaved: -1 } },
    );

    return this.savedArticleModel.findOneAndRemove({
      author: user._id,
      articleId,
    });
  }
}
