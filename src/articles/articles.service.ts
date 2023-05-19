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
import { ArticleResponseType } from './interfaces/article-response.interface';
import { SavedArticle } from '../saved-articles/schemas/saved-article.schema';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name)
    private savedArticleModel: Model<SavedArticle>,
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

  async findByQuery(query: object): Promise<NullableType<Article>> {
    const article = await this.articleModel.findById(query);
    if (!article) {
      throw new NotFoundException(`Article not found`);
    }

    return article;
  }

  async findOne(
    user: User,
    articleId: Types.ObjectId,
  ): Promise<ArticleResponseType> {
    const savedArticleCnt = await this.savedArticleModel
      .find({
        addedBy: user._id,
        articleId,
      })
      .countDocuments();
    const isSavedByUser: boolean = savedArticleCnt >= 1;

    const article: ArticleDocument = await this.articleModel.findById(
      articleId,
    );
    if (!article) {
      throw new NotFoundException(`Article not found`);
    }

    return { ...article.toObject(), isSavedByUser };
  }

  async findManyWithPagination(
    user: User,
    page = 1,
    perPage?: number,
  ): Promise<ArticleResponseType[]> {
    const articles: Article[] = await this.articleModel
      .find()
      .limit(perPage)
      .skip(perPage * (page - 1));

    let savedArticles: Types.ObjectId[] = [];

    if (user) {
      savedArticles = await this.savedArticleModel
        .find({ addedBy: user._id })
        .distinct('articleId');
    }

    const savedArticlesStr = savedArticles.toString();
    const articlesRes: ArticleResponseType[] = articles.map(
      (it: ArticleDocument) => {
        const isSavedByUser = _.includes(savedArticlesStr, it._id.toString());
        return { ...it.toObject(), isSavedByUser } as ArticleResponseType;
      },
    );
    return articlesRes;
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
