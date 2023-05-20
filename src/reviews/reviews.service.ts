import { _ } from 'lodash';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { NullableType } from 'src/utils/types/nullable.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async checkResourceAccess(user: User, _id: Types.ObjectId): Promise<boolean> {
    if (_.includes(user.roles, 'admin')) return true;

    const review: Review | null = await this.reviewModel.findOne({ _id });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!_.isEqual(review.addedBy._id, user._id)) {
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

  create(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    loggedUser: User,
    createDto: CreateReviewDto,
  ) {
    const createdReview: ReviewDocument = new this.reviewModel(
      _.assign(createDto, {
        addedBy: loggedUser._id,
        article: articleId,
        claim: claimId,
      }),
    );
    return createdReview.save();
  }

  async findOne(query: object): Promise<NullableType<Review>> {
    const claim = await this.reviewModel.findOne(query);
    if (!claim) {
      throw new NotFoundException(`Review not found`);
    }
    return claim;
  }

  async findManyWithPagination(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    page = 1,
    perPage = 20,
  ): Promise<Review[]> {
    return this.reviewModel
      .find({ article: articleId, claim: claimId })
      .skip(perPage * (page - 1))
      .limit(perPage);
  }

  async replace(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    reviewId: Types.ObjectId,
    reviewDto: CreateReviewDto,
    loggedUser: User,
  ): Promise<Review> {
    await this.checkResourceAccess(loggedUser, reviewId);

    throw new NotImplementedException('Not yet implemented');
    // const createdReview: ReviewDocument = new this.reviewModel(
    //   _.assign(reviewDto, {
    //     addedBy: loggedUser._id,
    //     article: articleId,
    //     claim: claimId,
    //   }),
    // );
    // return createdReview.save();
  }

  async delete(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    reviewId: Types.ObjectId,
    loggedUser: User,
  ): Promise<Review> {
    await this.checkResourceAccess(loggedUser, reviewId);

    const deletedClaim = await this.reviewModel.findOneAndDelete({
      article: articleId,
      claim: claimId,
      _id: reviewId,
    });
    if (!deletedClaim) {
      throw new NotFoundException(`Review #${reviewId} not found`);
    }
    return deletedClaim;
  }
}
