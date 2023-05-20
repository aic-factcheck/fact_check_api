import { _ } from 'lodash';
import {
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
import { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class ClaimsService {
  constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

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

  async findOne(query: object): Promise<NullableType<Claim>> {
    // TODO add review by current user if exists
    const claim = await this.claimModel.findOne(query);
    if (!claim) {
      throw new NotFoundException(`Claim not found`);
    }
    return claim;
  }

  async findManyWithPagination(
    articleId: Types.ObjectId,
    page = 1,
    perPage = 20,
  ): Promise<Claim[]> {
    // TODO add current user's reviews
    return this.claimModel
      .find({ article: articleId })
      .skip(perPage * (page - 1))
      .limit(perPage);
  }

  // async update(
  //   _id: Types.ObjectId,
  //   updateClaimDto: UpdateClaimDto,
  // ): Promise<Claim> {
  // await this.checkResourceAccess(loggedUser, claimId);
  //   const updatedClaim: Claim = await this.claimModel.findByIdAndUpdate(
  //     _id,
  //     updateClaimDto,
  //     {
  //       returnOriginal: false,
  //     },
  //   );
  //   if (!updatedClaim) {
  //     throw new NotFoundException(`Claim #${updatedClaim._id} not found`);
  //   }
  //   return updatedClaim;
  // }

  // async replace(
  //   _id: Types.ObjectId,
  //   loggedUser: User,
  //   claimDto: ReplaceClaimDto,
  // ): Promise<Claim> {
  // await this.checkResourceAccess(loggedUser, claimId);
  //   return this.claimModel.findByIdAndUpdate(
  //     _id,
  //     _.assign(claimDto, { addedBy: loggedUser._id }),
  //     {
  //       override: true,
  //       upsert: true,
  //       returnOriginal: false,
  //     },
  //   );
  // }

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
