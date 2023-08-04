import { Types } from 'mongoose';
import { VoteObjectEnum } from '../enums/vote.enum';
import { CreateVoteDto } from '../dto/create-vote.dto';
import { User } from '../../users/schemas/user.schema';

// vote queue payload type
export interface VoteQueueType {
  referencedId: Types.ObjectId;
  type: VoteObjectEnum;
  createDto: CreateVoteDto;
  loggedUser: User;
}
