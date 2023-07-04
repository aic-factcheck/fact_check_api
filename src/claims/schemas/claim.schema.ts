import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { Article } from '../../articles/schemas/article.schema';
import { ClaimHistoryType } from '../types/claim-history.type';

export type ClaimDocument = HydratedDocument<Claim>;

@Schema({ timestamps: true })
export class Claim {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: { select: '-password' },
  })
  author: User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Article',
    required: true,
    autopopulate: { maxDepth: 1 },
  })
  article: Article;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Article',
    required: true,
  })
  articles: Article[];

  @Prop({ required: true, maxlength: 512, index: 'text' })
  text: string;

  @Prop({ required: true, default: 'en', index: true })
  lang: string;

  @Prop({ default: 0 })
  nNegativeVotes: number;

  @Prop({ default: 0 })
  nPositiveVotes: number;

  @Prop({ type: [String], default: [], index: true })
  categories: string[];

  @Prop({ default: 0 })
  nViews: number;

  @Prop({ default: 0 })
  nReviews: number;

  @Prop({ default: [], maxlength: 3 })
  history: ClaimHistoryType[];

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;

  @Prop({ default: false })
  isRated: boolean;

  @Prop({ min: 0, max: 10 })
  rating: number;

  @Prop()
  ratedAt: Date;
}

const claimSchema = SchemaFactory.createForClass(Claim);
// eslint-disable-next-line @typescript-eslint/no-var-requires
claimSchema.plugin(require('mongoose-autopopulate'));

export { claimSchema as ClaimSchema };
