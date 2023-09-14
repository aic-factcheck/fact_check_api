import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Article } from '../../articles/schemas/article.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class DoesArticleExist implements CanActivate {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    private readonly i18nService: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    if (!mongoose.Types.ObjectId.isValid(params.articleId)) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18nService.t('errors.invalid_objectid', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    const article = await this.articleModel.findOne({ _id: params.articleId });
    if (article) {
      return true;
    }
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: this.i18nService.t('errors.article_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    });
  }
}
