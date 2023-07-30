import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { GameAtionEnum } from '../enums/reputation.enum';

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
    index: true,
  })
  user: User;

  @Prop({ required: true, type: Number })
  points: number;

  @Prop({ type: Types.ObjectId, index: true })
  referencedId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: GameAtionEnum })
  action: GameAtionEnum;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReputationSchema = SchemaFactory.createForClass(Reputation);
