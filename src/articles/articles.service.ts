// import { _, omit } from 'lodash';
import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NullableType } from '../utils/types/nullable.type';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createdArticle: ArticleDocument = new this.articleModel(
      createArticleDto,
    );
    return createdArticle.save();
  }

  async findOne(query: object): Promise<NullableType<Article>> {
    return this.articleModel.findOne(query);
  }

  async findManyWithPagination(page = 1, limit?: number): Promise<Article[]> {
    return this.articleModel
      .find()
      .skip(page * limit)
      .limit(limit)
      .exec();
  }

  // async update(
  //   _id: Types.ObjectId,
  //   article: Article,
  //   updateArticleDto: UpdateArticleDto,
  // ): Promise<Article> {
  //   const ommitRoles: string = _.includes(article.roles, 'admin')
  //     ? 'roles'
  //     : '';
  //   updateArticleDto = omit(updateArticleDto, ommitRoles);

  //   const updatedArticle: Article = await this.articleModel.findByIdAndUpdate(
  //     _id,
  //     updateArticleDto,
  //     {
  //       returnOriginal: false,
  //     },
  //   );
  //   if (!updatedArticle) {
  //     throw new NotFoundException(`Article #${article._id} not found`);
  //   }
  //   return updatedArticle;
  // }

  // async replace(
  //   _id: Types.ObjectId,
  //   article: Article,
  //   articleDto: ReplaceArticleDto,
  // ): Promise<Article> {
  //   if (!_.includes(article.roles, 'admin'))
  //     articleDto = omit(articleDto, 'roles');

  //   return await this.articleModel.findByIdAndUpdate(_id, articleDto, {
  //     override: true,
  //     upsert: true,
  //     returnOriginal: false,
  //   });
  // }

  async delete(articleId: Types.ObjectId): Promise<Article> {
    const deletedArticle = await this.articleModel.findByIdAndDelete(articleId);
    if (!deletedArticle) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }
    return deletedArticle;
  }
}
