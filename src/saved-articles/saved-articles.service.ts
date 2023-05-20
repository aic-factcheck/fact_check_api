import { Model, Types } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { User } from '../users/schemas/user.schema';
import {
  SavedArticle,
  SavedArticleDocument,
} from './schemas/saved-article.schema';
import { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class SavedArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name)
    private readonly savedArticleModel: Model<SavedArticle>,
  ) {}

  async save(user: User, articleId: Types.ObjectId): Promise<SavedArticle> {
    const articleCnt = await this.articleModel
      .findById(articleId)
      .countDocuments();
    const alreadySaved = await this.savedArticleModel
      .findOne({
        addedBy: user._id,
        articleId,
      })
      .countDocuments();

    if (alreadySaved !== 0 || articleCnt < 1) {
      throw new BadRequestException('Saving article failed');
    }

    await this.articleModel.findOneAndUpdate(
      { _id: articleId },
      { $inc: { nSaved: 1 } },
    );
    const newArticle: SavedArticleDocument = new this.savedArticleModel({
      addedBy: user._id,
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
      .find({ addedBy: user._id })
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
      addedBy: user._id,
      articleId,
    });
  }
}
