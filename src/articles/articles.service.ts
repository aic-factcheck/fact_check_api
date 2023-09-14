import { _ } from 'lodash';
import { Model, Types } from 'mongoose';
import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NullableType } from '../common/types/nullable.type';
import { Article, ArticleDocument } from './schemas/article.schema';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
// import { ReplaceArticleDto } from './dto/replace-article.dto';
import { User } from '../users/schemas/user.schema';
import { ArticleResponseType } from './types/article-response.type';
import {
  SavedArticle,
  SavedArticleDocument,
} from '../saved-articles/schemas/saved-article.schema';
import { GameService } from '../game/game.service';
import { GameAtionEnum } from '../game/enums/reputation.enum';
import { normalizeArticleUrl } from '../common/helpers/normalize-article-url.helper';

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
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Article not found',
      });
    }

    if (!_.isEqual(article.author._id, user._id)) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      });
    }

    return true;
  }

  async create(
    loggedUser: User,
    createDto: CreateArticleDto,
  ): Promise<Article> {
    const normUrl = normalizeArticleUrl(createDto.sourceUrl);
    createDto.sourceUrl = normUrl;

    const article = await this.articleModel.findOne({ sourceUrl: normUrl });

    if (article) {
      return article;
    }

    const createdArticle: ArticleDocument = new this.articleModel(
      _.assign(createDto, { author: loggedUser._id }),
    );
    this.gameService.addReputation(
      loggedUser,
      GameAtionEnum.CREATE_ARTICLE,
      createdArticle._id,
    );
    return createdArticle.save();
  }

  async findByQuery(query: object): Promise<NullableType<Article>> {
    const article = await this.articleModel.findById(query);
    if (!article) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Article not found',
      });
    }

    return article;
  }

  async findOne(
    user: User,
    articleId: Types.ObjectId,
  ): Promise<ArticleResponseType> {
    const savedArticlePromise: Promise<SavedArticleDocument | null> =
      this.savedArticleModel.findOne({
        author: user._id,
        articleId,
      });
    const articlePromise: Promise<ArticleDocument | null> =
      this.articleModel.findById(articleId);

    const [savedArticle, article] = await Promise.all([
      savedArticlePromise,
      articlePromise,
    ]);
    const isSavedByUser: boolean = Boolean(savedArticle);

    if (!article) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Article not found',
      });
    }

    return { ...article.toObject(), isSavedByUser };
  }

  async findManyWithPagination(
    loggedUser: User,
    page = 1,
    perPage = 20,
  ): Promise<ArticleResponseType[]> {
    const articles: Article[] | null = await this.articleModel
      .find()
      .limit(perPage)
      .skip(perPage * (page - 1));

    let savedArticles: Set<string> = new Set();

    if (loggedUser) {
      const savedArticleIds: Types.ObjectId[] = await this.savedArticleModel
        .find({ author: loggedUser._id })
        .distinct('articleId');
      savedArticles = new Set(savedArticleIds.map((id) => id.toString()));
    }

    const articlesRes: ArticleResponseType[] = articles.map(
      (article: ArticleDocument): ArticleResponseType => {
        const isSavedByUser = savedArticles.has(article._id.toString());
        return { ...article.toObject(), isSavedByUser };
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
    const updatedArticle = await this.articleModel.findByIdAndUpdate(
      _id,
      updateArticleDto,
      { returnOriginal: false },
    );

    if (!updatedArticle) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Article not found',
      });
    }
    return updatedArticle;
  }

  async delete(_id: Types.ObjectId, loggedUser: User): Promise<Article> {
    await this.checkResourceAccess(loggedUser, _id);

    const deletedArticle = await this.articleModel.findByIdAndDelete(_id);
    if (!deletedArticle) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Article not found',
      });
    }
    return deletedArticle;
  }
}
