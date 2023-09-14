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

@Injectable()
export class DoesReviewExist implements CanActivate {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    if (!mongoose.Types.ObjectId.isValid(params.reviewId)) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Invalid ObjectId',
      });
    }

    const review = await this.reviewModel.findOne({ _id: params.reviewId });
    if (review) {
      return true;
    }
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Review not found',
    });
  }
}
