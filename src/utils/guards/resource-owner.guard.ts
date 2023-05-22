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
import { Article } from '../../articles/schemas/article.schema';
import { ArticlesService } from '../../articles/articles.service';
import mongoose from 'mongoose';
import { ClaimsService } from '../../claims/claims.service';
import { Review } from '../../reviews/schemas/review.schema';
import { ReviewsService } from '../../reviews/reviews.service';
import { Claim } from '../../claims/schemas/claim.schema';

export const IsResourceOwnerGuard = (paramId: string) => {
  @Injectable()
  class IsResourceOwnerMixin implements CanActivate {
    constructor(
      @Inject(ArticlesService) public articleService: ArticlesService,
      @Inject(ClaimsService) public claimService: ClaimsService,
      @Inject(ReviewsService) public reviewService: ReviewsService,
    ) {}

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

      let resource: Article | Claim | Review | null = null;

      if (paramId === 'articleId') {
        resource = await this.articleService.findByQuery({ _id });
      } else if (paramId === 'claimId') {
        resource = await this.claimService.findByQuery({ _id });
      } else if (paramId === 'reviewId') {
        resource = await this.reviewService.findByQuery({ _id });
      }

      if (!resource) return false;

      if (resource.addedBy._id !== request.user._id) return false;

      return true;
    }
  }

  const guard = mixin(IsResourceOwnerMixin);
  return guard;
};
