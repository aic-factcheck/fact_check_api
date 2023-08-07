import { Types } from 'mongoose';

// bg-article queue payload type
export interface BgArticleQueueType {
  sourceUrl: string;
  author: Types.ObjectId;
}
