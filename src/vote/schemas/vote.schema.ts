import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { VoteObjectEnum } from '../enums/vote.enum';

export type VoteDocument = HydratedDocument<Vote>;

@Schema({ timestamps: true })
export class Vote {
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
  author: User;

  @Expose()
  @Prop({ required: true, type: Types.ObjectId, index: true })
  @Transform((params) => params.obj._id.toString())
  referencedId: Types.ObjectId;

  @Prop({ required: true, enum: VoteObjectEnum, index: true })
  type: string;

  @Prop({ maxlength: 512 })
  text: string;

  @Prop({ required: true, type: Number, min: -1, max: 10 })
  rating: number;

  @Prop({ default: 'en' })
  lang: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
