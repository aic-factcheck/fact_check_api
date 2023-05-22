import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { ReputationEnum } from '../enums/reputation.enum';

export type ReputationDocument = HydratedDocument<Reputation>;

@Schema({ timestamps: true })
export class Reputation {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  user: User;

  @Prop({ required: true, type: Number })
  rep: number;

  @Prop({ required: true, type: String, enum: ReputationEnum })
  action: ReputationEnum;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const ReputationSchema = SchemaFactory.createForClass(Reputation);
