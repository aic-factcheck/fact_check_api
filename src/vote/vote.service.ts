import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Model, Types } from 'mongoose';
import { VoteObjectEnum } from './enums/vote.enum';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../articles/schemas/article.schema';
import { Review } from '../reviews/schemas/review.schema';
import { Claim } from '../claims/schemas/claim.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VOTES_QUEUE_NAME } from './vote.constants';
import { VoteQueueType } from './types/vote-queue.type';
import { VoteJobResponseType } from './types/vote-job-response.type';

@Injectable()
export class VoteService {
  private modelMapping;

  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectQueue(VOTES_QUEUE_NAME) private votesQueue: Queue,
  ) {
    this.modelMapping = {
      [VoteObjectEnum.ARTICLE]: this.articleModel,
      [VoteObjectEnum.CLAIM]: this.claimModel,
      [VoteObjectEnum.REVIEW]: this.reviewModel,
      [VoteObjectEnum.USER]: this.userModel,
    };
  }

  async create(
    referencedId: Types.ObjectId,
    type: VoteObjectEnum,
    createDto: CreateVoteDto,
    loggedUser: User,
  ): Promise<VoteJobResponseType> {
    const countRef = await this.modelMapping[type].countDocuments({
      _id: referencedId,
    });

    if (countRef === 0) {
      throw new NotFoundException('Referenced object not found');
    }

    const queueData: VoteQueueType = {
      referencedId,
      type,
      createDto,
      loggedUser,
    };
    const job = await this.votesQueue.add(queueData);
    return { jobId: String(job.id), status: 'Job has been queued.' };
  }
}
