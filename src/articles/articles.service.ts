import { _ } from 'lodash';
import { Model, Types } from 'mongoose';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NullableType } from '../common/types/nullable.type';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ReplaceArticleDto } from './dto/replace-article.dto';
import { User } from '../users/schemas/user.schema';
import { ArticleResponseType } from './types/article-response.type';
import { SavedArticle } from '../saved-articles/schemas/saved-article.schema';
import { GameService } from '../game/game.service';
import { GameAtionEnum } from '../game/enums/reputation.enum';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(SavedArticle.name)
    private savedArticleModel: Model<SavedArticle>,
    private readonly gameService: GameService,
  ) {}

  async checkResourceAccess(user: User, _id: Types.ObjectId): Promise<boolean> {
    if (_.includes(user.roles, 'admin')) return true;

    const article: Article | null = await this.articleModel.findOne({ _id });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (!_.isEqual(article.author._id, user._id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }

  async create(
    loggedUser: User,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    const createdArticle: ArticleDocument = new this.articleModel(
      _.assign(createArticleDto, { author: loggedUser._id }),
    );
    this.gameService.addReputation(loggedUser, GameAtionEnum.CREATE_ARTICLE);
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
        author: user._id,
        articleId,
      })
      .countDocuments();
    const isSavedByUser: boolean = savedArticleCnt >= 1;

    const article: ArticleDocument | null = await this.articleModel.findById(
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
    perPage = 20,
  ): Promise<ArticleResponseType[]> {
    const articles: Article[] | null = await this.articleModel
      .find()
      .limit(perPage)
      .skip(perPage * (page - 1));

    let savedArticles: Types.ObjectId[] = [];

    if (user) {
      savedArticles = await this.savedArticleModel
        .find({ author: user._id })
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
    loggedUser: User,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    await this.checkResourceAccess(loggedUser, _id);
    const updatedArticle: Article | null =
      await this.articleModel.findByIdAndUpdate(_id, updateArticleDto, {
        returnOriginal: false,
      });
    if (!updatedArticle) {
      throw new NotFoundException(`Article not found`);
    }
    return updatedArticle;
  }

  async replace(
    _id: Types.ObjectId,
    loggedUser: User,
    articleDto: ReplaceArticleDto,
  ): Promise<Article> {
    await this.checkResourceAccess(loggedUser, _id);
    return this.articleModel.findByIdAndUpdate(_id, articleDto, {
      override: true,
      upsert: true,
      returnOriginal: false,
    });
  }

  async delete(_id: Types.ObjectId, loggedUser: User): Promise<Article> {
    await this.checkResourceAccess(loggedUser, _id);

    const deletedArticle = await this.articleModel.findByIdAndDelete(_id);
    if (!deletedArticle) {
      throw new NotFoundException(`Article #${_id} not found`);
    }
    return deletedArticle;
  }
}
