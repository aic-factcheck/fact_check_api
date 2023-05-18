import { _ } from 'lodash';
import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NullableType } from '../utils/types/nullable.type';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ReplaceArticleDto } from './dto/replace-article.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async create(
    loggedUser: User,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    const createdArticle: ArticleDocument = new this.articleModel(
      _.assign(createArticleDto, { addedBy: loggedUser._id }),
    );
    return createdArticle.save();
  }

  async findOne(query: object): Promise<NullableType<Article>> {
    const article = await this.articleModel.findOne(query).populate('addedBy', {
      firstName: 1,
      lastName: 1,
      email: 1,
      _id: 1,
      createdAt: 1,
    });
    if (!article) {
      throw new NotFoundException(`Article not found`);
    }
    return article;
  }

  async findManyWithPagination(page = 1, limit?: number): Promise<Article[]> {
    return this.articleModel
      .find()
      .skip(page * limit)
      .limit(limit)
      .populate('addedBy', {
        firstName: 1,
        lastName: 1,
        email: 1,
        _id: 1,
        createdAt: 1,
      })
      .exec();
  }

  async update(
    _id: Types.ObjectId,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const updatedArticle: Article = await this.articleModel.findByIdAndUpdate(
      _id,
      updateArticleDto,
      {
        returnOriginal: false,
      },
    );
    if (!updatedArticle) {
      throw new NotFoundException(`Article #${updatedArticle._id} not found`);
    }
    return updatedArticle;
  }

  async replace(
    _id: Types.ObjectId,
    loggedUser: User,
    articleDto: ReplaceArticleDto,
  ): Promise<Article> {
    return await this.articleModel.findByIdAndUpdate(
      _id,
      _.assign(articleDto, { addedBy: loggedUser._id }),
      {
        override: true,
        upsert: true,
        returnOriginal: false,
      },
    );
  }

  async delete(articleId: Types.ObjectId): Promise<Article> {
    const deletedArticle = await this.articleModel.findByIdAndDelete(articleId);
    if (!deletedArticle) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }
    return deletedArticle;
  }
}
