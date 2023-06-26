import { Types } from 'mongoose';
import { VoteTypes } from '../enums/vote.types';

export interface ReviewHistoryType {
  text: string;
  vote: VoteTypes;
  links: string[];
  lang: string;
  updatedAt: Date;
  author: Types.ObjectId;
}
