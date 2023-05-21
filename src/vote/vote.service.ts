import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Model, Types } from 'mongoose';
import { VoteObjectEnum } from './enums/vote.enum';
import { User } from '../users/schemas/user.schema';
import { Vote, VoteDocument } from './schemas/vote.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { Review } from '../reviews/schemas/review.schema';
import { Claim } from '../claims/schemas/claim.schema';

@Injectable()
export class VoteService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async referencedObjExists(
    referencedId: Types.ObjectId,
    type: VoteObjectEnum,
  ) {
    let docCount;

    if (type === VoteObjectEnum.ARTICLE) {
      docCount = await this.articleModel.countDocuments({ _id: referencedId });
    } else if (type === VoteObjectEnum.CLAIM) {
      docCount = await this.claimModel.countDocuments({ _id: referencedId });
    } else if (type === VoteObjectEnum.REVIEW) {
      docCount = await this.reviewModel.countDocuments({ _id: referencedId });
    } else if (type === VoteObjectEnum.USER) {
      docCount = await this.userModel.countDocuments({ _id: referencedId });
    }

    return docCount;
  }

  async unvote(referencedId: Types.ObjectId, type: VoteObjectEnum) {
    const oldVote: VoteDocument | null = await this.voteModel.findOneAndDelete({
      referencedId,
      type,
    });

    if (!oldVote) return;

    let nPositiveVotes = 0;
    let nNegativeVotes = 0;
    let nNeutralVotes = 0;

    if (oldVote.rating === 1) nPositiveVotes = -1;
    if (oldVote.rating === 0) nNeutralVotes = -1;
    if (oldVote.rating === -1) nNegativeVotes = -1;

    if (type === VoteObjectEnum.USER) {
      await this.userModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: { nBeenVoted: -1, nPositiveVotes, nNegativeVotes },
        },
        {
          returnDocument: 'after',
        },
      );
    } else if (type === VoteObjectEnum.ARTICLE) {
      await this.articleModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: { nBeenVoted: -1, nPositiveVotes, nNegativeVotes },
        },
        {
          returnDocument: 'after',
        },
      );
    } else if (type === VoteObjectEnum.CLAIM) {
      await this.claimModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: { nBeenVoted: -1, nPositiveVotes, nNegativeVotes },
        },
        {
          returnDocument: 'after',
        },
      );
    } else if (type === VoteObjectEnum.REVIEW) {
      await this.reviewModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: {
            nBeenVoted: -1,
            nPositiveVotes,
            nNegativeVotes,
            nNeutralVotes,
          },
        },
        {
          returnDocument: 'after',
        },
      );
    }
  }

  async vote(
    referencedId: Types.ObjectId,
    type: VoteObjectEnum,
    addedBy: User,
    rating: number,
  ) {
    let res;
    const vote = new this.voteModel({
      addedBy: addedBy._id,
      rating,
      referencedId,
      type,
    });

    let nPositiveVotes = 0;
    let nNegativeVotes = 0;
    let nNeutralVotes = 0;
    const nBeenVoted = 1;
    if (rating === 1) nPositiveVotes = 1;
    if (rating === 0) nNeutralVotes = 1;
    if (rating === -1) nNegativeVotes = 1;

    if (type === VoteObjectEnum.USER) {
      res = await this.userModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: { nBeenVoted, nPositiveVotes, nNegativeVotes },
        },
        {
          returnDocument: 'after',
        },
      );
    } else if (type === VoteObjectEnum.ARTICLE) {
      res = await this.articleModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: { nBeenVoted, nPositiveVotes, nNegativeVotes },
        },
        {
          returnDocument: 'after',
        },
      );
    } else if (type === VoteObjectEnum.CLAIM) {
      res = await this.claimModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: { nBeenVoted, nPositiveVotes, nNegativeVotes },
        },
        {
          returnDocument: 'after',
        },
      );
    } else if (type === VoteObjectEnum.REVIEW) {
      res = await this.reviewModel.findOneAndUpdate(
        { _id: referencedId },
        {
          $inc: {
            nBeenVoted,
            nPositiveVotes,
            nNegativeVotes,
            nNeutralVotes,
          },
        },
        {
          returnDocument: 'after',
        },
      );
    } else {
      throw new BadRequestException('Referenced object does not exist.');
    }

    await vote.save();
    return res;
  }

  async create(
    referencedId: Types.ObjectId,
    type: VoteObjectEnum,
    createDto: CreateVoteDto,
    loggedUser: User,
  ): Promise<Vote> {
    if ((await this.referencedObjExists(referencedId, type)) === 0) {
      throw new NotFoundException('Referenced object not found');
    }

    await this.unvote(referencedId, type);

    return this.vote(referencedId, type, loggedUser, createDto.rating);
  }
}
