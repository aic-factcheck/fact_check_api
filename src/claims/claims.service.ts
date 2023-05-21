import { _ } from 'lodash';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { Claim, ClaimDocument } from './schemas/claim.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { Model, Types } from 'mongoose';
import { NullableType } from '../utils/types/nullable.type';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { ClaimResponseType } from './types/claim-response.type';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async checkResourceAccess(user: User, _id: Types.ObjectId): Promise<boolean> {
    if (_.includes(user.roles, 'admin')) return true;

    const claim: Claim | null = await this.claimModel.findOne({ _id });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (!_.isEqual(claim.addedBy._id, user._id)) {
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
        addedBy: loggedUser._id,
        article: articleId,
        articles: [articleId],
      }),
    );
    // TODO add claimId to Article{articleId}.claims
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
    const claim: ClaimDocument | null = await this.claimModel.findOne({
      _id: claimId,
      article: articleId,
    });
    if (!claim) {
      throw new NotFoundException(`Claim not found`);
    }

    const userReview: ReviewDocument | null = await this.reviewModel.findOne({
      addedBy: loggedUser._id,
      claim: claimId,
    });

    return {
      ...claim.toObject(),
      userReview,
    } as ClaimResponseType;
  }

  /*
   * Takes `claims` array and logged user array of `reviews`
   * returns new array of merged claims with user's review for each claim
   */
  async mergeClaimsWithReviews(
    claims: ClaimDocument[],
    reviews: ReviewDocument[],
  ): Promise<ClaimResponseType[]> {
    const mergedClaims: ClaimResponseType[] = claims.map((claim) => {
      const userReview = _.find(reviews, { claimId: claim._id });

      return {
        ...claim.toObject(),
        userReview,
      } as ClaimResponseType;
      // const mergedClaim = _.assign(claim, { userReview });
      // if (userReview) {
      //   mergedClaim.userReview = userReview.vote;
      // } else {
      //   mergedClaim.userReview = null;
      // }
      // return mergedClaim;
    });

    return mergedClaims;
  }

  async findManyWithPagination(
    articleId: Types.ObjectId,
    page = 1,
    perPage = 20,
    loggedUser: User,
  ): Promise<ClaimResponseType[]> {
    const userReviews: ReviewDocument[] = await this.reviewModel
      .find({ addedBy: loggedUser._id })
      .lean();

    const claims: ClaimDocument[] = await this.claimModel
      .find({ article: articleId })
      .skip(perPage * (page - 1))
      .limit(perPage);

    return this.mergeClaimsWithReviews(claims, userReviews);
  }

  async replace(
    _id: Types.ObjectId,
    loggedUser: User,
    claimDto: CreateClaimDto,
  ): Promise<Claim> {
    await this.checkResourceAccess(loggedUser, _id);
    // TODO should not delete old.. just create new object
    throw new NotImplementedException('Not yet implemented');
    // return this.claimModel.findByIdAndUpdate(
    //   _id,
    //   _.assign(claimDto, { addedBy: loggedUser._id }),
    //   {
    //     override: true,
    //     upsert: true,
    //     returnOriginal: false,
    //   },
    // );
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
