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
import { Review } from '../../reviews/schemas/review.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class DoesReviewExist implements CanActivate {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private readonly i18nService: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    if (!mongoose.Types.ObjectId.isValid(params.reviewId)) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18nService.t('errors.invalid_objectid', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    const review = await this.reviewModel.findOne({ _id: params.reviewId });
    if (review) {
      return true;
    }
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: this.i18nService.t('errors.review_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    });
  }
}
