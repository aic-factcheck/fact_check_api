import { Injectable } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Model, Types } from 'mongoose';
import { VoteObjectEnum } from './enums/vote.enum';
import { User } from '../users/schemas/user.schema';
import { Vote, VoteDocument } from './schemas/vote.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { Review } from '../reviews/schemas/review.schema';
import { Claim } from '../claims/schemas/claim.schema';
import { GameService } from '../game/game.service';
import { GameAtionEnum } from '../game/enums/reputation.enum';

@Injectable()
export class VoteService {
  private modelMapping;

  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly gameService: GameService,
  ) {
    this.modelMapping = {
      [VoteObjectEnum.ARTICLE]: this.articleModel,
      [VoteObjectEnum.CLAIM]: this.claimModel,
      [VoteObjectEnum.REVIEW]: this.reviewModel,
      [VoteObjectEnum.USER]: this.userModel,
    };
  }

  async unvote(referencedId: Types.ObjectId, type: VoteObjectEnum, user: User) {
    const oldVote: VoteDocument | null = await this.voteModel.findOneAndDelete({
      author: user._id,
      referencedId,
      type,
    });

    if (!oldVote) {
      this.gameService.addReputation(user, GameAtionEnum.VOTE);
      return;
    }

    const voteUpdate = {
      nPositiveVotes: oldVote.rating === 1 ? -1 : 0,
      nNeutralVotes: oldVote.rating === 0 ? -1 : 0,
      nNegativeVotes: oldVote.rating === -1 ? -1 : 0,
    };

    this.modelMapping[type].findOneAndUpdate(
      { _id: referencedId },
      { $inc: voteUpdate },
      { returnDocument: 'after' },
    );
  }

  async vote(
    referencedId: Types.ObjectId,
    type: VoteObjectEnum,
    author: User,
    rating: number,
  ) {
    const vote = new this.voteModel({
      author: author._id,
      rating,
      referencedId,
      type,
    });

    const voteUpdate = {
      nPositiveVotes: rating === 1 ? 1 : 0,
      nNeutralVotes: rating === 0 ? 1 : 0,
      nNegativeVotes: rating === -1 ? 1 : 0,
    };

    const res = await this.modelMapping[type].findOneAndUpdate(
      { _id: referencedId },
      { $inc: voteUpdate },
      { returnDocument: 'after' },
    );

    await vote.save();
    return res;
  }

  async create(
    referencedId: Types.ObjectId,
    type: VoteObjectEnum,
    createDto: CreateVoteDto,
    loggedUser: User,
  ): Promise<Vote> {
    await this.unvote(referencedId, type, loggedUser);
    return this.vote(referencedId, type, loggedUser, createDto.rating);
  }
}
