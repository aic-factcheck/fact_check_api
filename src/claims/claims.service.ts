import { _ } from 'lodash';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Claim, ClaimDocument } from './schemas/claim.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { Model, Types } from 'mongoose';
import { NullableType } from '../common/types/nullable.type';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { ClaimResponseType } from './types/claim-response.type';
import { mergeClaimsWithReviews } from '../common/helpers/merge-claims-reviews.helper';
import { GameService } from '../game/game.service';
import { GameAtionEnum } from '../game/enums/reputation.enum';
import { Article } from '../articles/schemas/article.schema';
import { ClaimHistoryType } from './types/claim-history.type';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private readonly gameService: GameService,
  ) {}

  async checkResourceAccess(user: User, _id: Types.ObjectId): Promise<boolean> {
    if (_.includes(user.roles, 'admin')) return true;

    const claim: Claim | null = await this.claimModel.findOne({ _id });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (!_.isEqual(claim.author._id, user._id)) {
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
    articleId: Types.ObjectId,
    loggedUser: User,
    createDto: CreateClaimDto,
  ): Promise<Claim> {
    const createdClaim: ClaimDocument = new this.claimModel(
      _.assign(createDto, {
        author: loggedUser._id,
        article: articleId,
        articles: [articleId],
      }),
    );
    this.gameService.addReputation(
      loggedUser,
      GameAtionEnum.CREATE_CLAIM,
      createdClaim._id,
    );
    this.articleModel.findByIdAndUpdate(articleId, {
      $push: { savedArticles: createdClaim._id },
    });
    return createdClaim.save();
  }

  async findByQuery(query: object): Promise<NullableType<Claim>> {
    const claim = await this.claimModel.findById(query);
    if (!claim) {
      throw new NotFoundException(`Claim not found`);
    }

    return claim;
  }

  async findOne(
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
    loggedUser: User,
  ): Promise<NullableType<ClaimResponseType>> {
    const [claim, userReview]: [ClaimDocument | null, Review | null] =
      await Promise.all([
        this.claimModel.findOneAndUpdate(
          {
            _id: claimId,
            article: articleId,
          },
          { $inc: { nViews: 1 } },
          { new: true },
        ),
        this.reviewModel
          .findOne({
            author: loggedUser._id,
            claim: claimId,
          })
          .lean(),
      ]);

    if (!claim) {
      throw new NotFoundException(`Claim not found`);
    }

    return { ...claim.toObject(), userReview };
  }

  async findManyWithPagination(
    articleId: Types.ObjectId,
    page = 1,
    perPage = 20,
    loggedUser: User | null,
  ): Promise<ClaimResponseType[]> {
    const claimsPromise: Promise<ClaimDocument[]> = this.claimModel
      .find({ article: articleId })
      .skip(perPage * (page - 1))
      .limit(perPage);

    const userReviewsPromise: Promise<ReviewDocument[]> = loggedUser
      ? this.reviewModel.find({ author: loggedUser._id }).lean()
      : Promise.resolve([]);

    const [claims, userReviews] = await Promise.all([
      claimsPromise,
      userReviewsPromise,
    ]);

    return mergeClaimsWithReviews(claims, userReviews);
  }

  async update(
    _id: Types.ObjectId,
    claimDto: CreateClaimDto,
    loggedUser: User,
  ): Promise<Claim> {
    await this.checkResourceAccess(loggedUser, _id);
    const currentClaim = await this.claimModel.findById(_id);
    if (!currentClaim) {
      throw new NotFoundException('Claim not found');
    }
    if (currentClaim.history.length >= 10) {
      throw new BadRequestException('Claim can be updated up to 10 times');
    }

    const historyObj: ClaimHistoryType = {
      text: currentClaim.text,
      lang: currentClaim.lang,
      updatedAt: new Date(),
      author: loggedUser._id,
      categories: currentClaim.categories,
    };

    return this.claimModel.findByIdAndUpdate(
      _id,
      _.assign(claimDto, {
        author: loggedUser._id,
        $push: { history: historyObj },
      }),
      {
        override: true,
        upsert: true,
        returnOriginal: false,
      },
    );
  }

  async delete(
    loggedUser: User,
    articleId: Types.ObjectId,
    claimId: Types.ObjectId,
  ): Promise<Claim> {
    await this.checkResourceAccess(loggedUser, claimId);

    const deleterClaim = await this.claimModel.findByIdAndDelete({
      article: articleId,
      _id: claimId,
    });
    if (!deleterClaim) {
      throw new NotFoundException(`Claim #${claimId} not found`);
    }
    return deleterClaim;
  }
}
