import { _ } from 'lodash';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  mixin,
} from '@nestjs/common';
import { Article } from '../schemas/article.schema';
import { ArticlesService } from '../articles.service';
import mongoose from 'mongoose';

export const IsArticleOwnerGuard = (paramId: string) => {
  @Injectable()
  class IsArticleOwnerMixin implements CanActivate {
    constructor(@Inject(ArticlesService) public service: ArticlesService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const _id: string = request.params[paramId];

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Invalid ObjectId',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (_.includes(request.user.roles, 'admin')) return true;

      const article: Article | null = await this.service.findByQuery({ _id });

      if (!article) return false;

      if (article.author._id !== request.user._id) return false;

      return true;
    }
  }

  const guard = mixin(IsArticleOwnerMixin);
  return guard;
};
