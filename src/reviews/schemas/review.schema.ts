import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { Article } from '../../articles/schemas/article.schema';
import { Claim } from '../../claims/schemas/claim.schema';
import { VoteTypes } from '../enums/vote.types';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: { select: '-password' },
    index: true,
  })
  addedBy: User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Article',
    required: true,
  })
  @Transform((params) => params.obj._id.toString())
  article: Article;

  @Prop({
    type: Types.ObjectId,
    ref: 'Claim',
    required: true,
    // autopopulate: { maxDepth: 1 },
    index: true,
  })
  @Transform((params) => params.obj._id.toString())
  claim: Claim;

  @Prop({ required: true, maxlength: 512, index: true })
  text: string;

  @Prop({ required: true, default: 'en' })
  lang: string;

  @Prop({ enum: VoteTypes, required: true })
  vote: string;

  @Prop({ default: 0 })
  nNegativeVotes: number;

  @Prop({ default: 0 })
  nPositiveVotes: number;

  @Prop({ default: 0 })
  nNeutralVotes: number;

  @Expose()
  get nBeenVoted(): number {
    return this.nPositiveVotes + this.nNegativeVotes;
  }

  @Prop({
    type: [{ type: String, maxLength: 512 }],
    required: true,
  })
  links: string[];

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
