import { _ } from 'lodash';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { NullableType } from '../common/types/nullable.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';
import { GameService } from '../game/game.service';
import { GameAtionEnum } from '../game/enums/reputation.enum';
import { Claim } from '../claims/schemas/claim.schema';
import { Vote } from '../vote/schemas/vote.schema';
import { ReviewResponseType } from './types/review-response.type';
import { VoteObjectEnum } from '../vote/enums/vote.enum';
import { ReviewHistoryType } from './types/review-history.type';
import { VoteTypes } from './enums/vote.types';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    private readonly gameService: GameService,
  ) {}

  async checkResourceAccess(user: User, _id: Types.ObjectId): Promise<boolean> {
    if (_.includes(user.roles, 'admin')) return true;

    const review: Review | null = await this.reviewModel.findOne({ _id });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (!_.isEqual(review.author._id, user._id)) {
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

  /*
   * Check whether user (who sends the request) already voted
   * for this claim -> throws conflict http status
   */
  checkCurrentUserReview = async (user: User, claimId) => {
    const review = await this.reviewModel.findOne({
      author: user._id,
      claim: claimId,
    });

    if (review) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: 'User already reviewed this claim.',
      });
    }
  };

  async create(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    loggedUser: User,
    createDto: CreateReviewDto,
  ): Promise<Review> {
    await this.checkCurrentUserReview(loggedUser, claimId);

    const createdReview: ReviewDocument = new this.reviewModel(
      _.assign(createDto, {
        author: loggedUser._id,
        article: articleId,
        claim: claimId,
      }),
    );

    this.gameService.addReputation(loggedUser, GameAtionEnum.CREATE_REVIEW);
    await this.userModel.findOneAndUpdate(
      { _id: loggedUser._id },
      { $inc: { nReviews: 1 } },
    );
    await this.claimModel.findOneAndUpdate(
      { _id: claimId },
      { $inc: { nReviews: 1 } },
    );
    return createdReview.save();
  }

  async findByQuery(query: object): Promise<NullableType<Review>> {
    const review = await this.reviewModel.findOne(query);
    // TODO add user's vote
    if (!review) {
      throw new NotFoundException(`Review not found`);
    }
    return review;
  }

  async findOne(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    reviewId: Types.ObjectId,
    loggedUser: User | null,
  ): Promise<NullableType<ReviewResponseType>> {
    const review: ReviewDocument | null = await this.reviewModel.findOne({
      _id: reviewId,
      claim: claimId,
      article: articleId,
    });

    if (!review) {
      throw new NotFoundException(`Review not found`);
    }

    let userVote: Vote | null = null;
    if (loggedUser) {
      userVote = await this.voteModel
        .findOne({
          referencedId: reviewId,
          author: loggedUser._id,
          type: VoteObjectEnum.REVIEW,
        })
        .lean();
    }

    return { ...review.toObject(), userVote } as ReviewResponseType;
  }

  async findManyWithPagination(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    page = 1,
    perPage = 20,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loggedUser: User,
  ): Promise<Review[]> {
    // TODO add user's vote
    return await this.reviewModel
      .find({ article: articleId, claim: claimId })
      .skip(perPage * (page - 1))
      .limit(perPage);

    // const reviewsRes: ReviewResponseType[] = reviews.map((it: Review) => {
    //   return { ...it, userVote: null } as ReviewResponseType;
    // });

    // const reviewIds = reviews.map((it: Review) => it._id);
    // const userVotes = await this.voteModel
    //   .aggregate([{ $match: { reviewId: { $in: reviewIds } } }])
    //   .project({ userVote: '$rating', _id: '$reviewId' });

    // const mergedReviews: ReviewResponseType[] = _.values(
    //   _.merge(_.keyBy(reviewsRes, '_id'), _.keyBy(userVotes, '_id')),
    // );
    // return mergedReviews;
  }

  async update(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    reviewId: Types.ObjectId,
    reviewDto: UpdateReviewDto,
    loggedUser: User,
  ): Promise<NullableType<Review>> {
    await this.checkResourceAccess(loggedUser, reviewId);

    const currentReview = await this.reviewModel.findById(reviewId);
    if (!currentReview) {
      throw new NotFoundException('Review not found');
    }
    if (currentReview.history.length >= 3) {
      throw new BadRequestException('Review can be updated up to 3 times');
    }

    const historyObj: ReviewHistoryType = {
      text: currentReview.text,
      lang: currentReview.lang,
      vote: VoteTypes[currentReview.vote],
      links: currentReview.links,
      updatedAt: new Date(),
      author: loggedUser._id,
    };

    return this.reviewModel.findByIdAndUpdate(
      reviewId,
      _.assign(
        reviewDto,
        {
          author: loggedUser._id,
          article: articleId,
          claim: claimId,
          $push: { history: historyObj },
        },
        {
          override: true,
          upsert: true,
          returnOriginal: false,
        },
      ),
    );
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
