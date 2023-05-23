import { Types } from 'mongoose';

export interface ClaimHistoryType {
  text: string;
  lang: string;
  updatedAt: Date;
  addedBy: Types.ObjectId;
}
