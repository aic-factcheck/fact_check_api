import { _ } from 'lodash';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { BackgroundArticleService } from '../background-article/background-article.service';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    private readonly gameService: GameService,
    private bgArticleService: BackgroundArticleService,
    private readonly i18nService: I18nService,
  ) {}

  private throwReviewNotFoundExcpetion(): never {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: this.i18nService.t('errors.review_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    });
  }

  async checkResourceAccess(user: User, _id: Types.ObjectId): Promise<boolean> {
    if (_.includes(user.roles, 'admin')) return true;

    const review: Review | null = await this.reviewModel.findOne({ _id });

    if (!review) this.throwReviewNotFoundExcpetion();

    if (!_.isEqual(review.author._id, user._id)) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: this.i18nService.t('errors.forbidden', {
          lang: I18nContext.current()?.lang,
        }),
      });
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
        message: this.i18nService.t('errors.review_already_exists', {
          lang: I18nContext.current()?.lang,
        }),
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

    const createdReview: ReviewDocument = new this.reviewModel({
      ...createDto,
      author: loggedUser._id,
      article: articleId,
      claim: claimId,
    });

    await Promise.all([
      this.gameService.addReputation(
        loggedUser,
        GameAtionEnum.CREATE_REVIEW,
        createdReview._id,
      ),
      this.userModel.findOneAndUpdate(
        { _id: loggedUser._id },
        { $inc: { nReviews: 1 } },
      ),
      this.claimModel.findOneAndUpdate(
        { _id: claimId },
        { $inc: { nReviews: 1 } },
      ),
    ]);

    await this.bgArticleService.saveReferencedArticles(
      createDto.links,
      loggedUser._id,
    );

    return createdReview.save();
  }

  async findByQuery(query: object): Promise<NullableType<Review>> {
    const review = await this.reviewModel.findOne(query);
    // TODO add user's vote
    if (!review) this.throwReviewNotFoundExcpetion();
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

    if (!review) this.throwReviewNotFoundExcpetion();

    let userVote: number | null = null;
    if (loggedUser) {
      const vote = await this.voteModel
        .findOne({
          referencedId: reviewId,
          author: loggedUser._id,
          type: VoteObjectEnum.REVIEW,
        })
        .lean();
      userVote = vote ? vote.rating : null;
    }

    return { ...review.toObject(), userVote } as ReviewResponseType;
  }

  async findManyWithPagination(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    page = 1,
    perPage = 20,
    loggedUser: User,
  ): Promise<Review[]> {
    const reviews: ReviewDocument[] = await this.reviewModel
      .find({ article: articleId, claim: claimId })
      .skip(perPage * (page - 1))
      .limit(perPage);

    const reviewsRes: ReviewResponseType[] = reviews.map(
      (it: ReviewDocument) => {
        return { ...it.toObject(), userVote: null } as ReviewResponseType;
      },
    );

    const reviewIds = reviews.map((it: Review) => it._id);
    let userVotes;
    if (loggedUser) {
      userVotes = await this.voteModel
        .aggregate([
          {
            $match: {
              referencedId: { $in: reviewIds },
              author: loggedUser._id,
            },
          },
        ])
        .project({ userVote: '$rating', _id: '$referencedId' });
    }

    const mergedReviews: ReviewResponseType[] = _.values(
      _.merge(_.keyBy(reviewsRes, '_id'), _.keyBy(userVotes, '_id')),
    );
    return mergedReviews;
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
    if (!currentReview) this.throwReviewNotFoundExcpetion();
    if (currentReview.history.length >= 10) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18nService.t('errors.max_review_update_requests', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    const historyObj: ReviewHistoryType = {
      text: currentReview.text,
      lang: currentReview.lang,
      vote: VoteTypes[currentReview.vote],
      links: currentReview.links,
      updatedAt: new Date(),
      author: loggedUser._id,
    };

    const updateObject = {
      ...reviewDto,
      author: loggedUser._id,
      article: articleId,
      claim: claimId,
      $push: { history: historyObj },
    };

    return this.reviewModel.findByIdAndUpdate(reviewId, updateObject, {
      override: true,
      upsert: true,
      returnOriginal: false,
    });
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
    if (!deletedClaim) this.throwReviewNotFoundExcpetion();

    return deletedClaim;
  }
}
