import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { ReportStatusEnum } from '../enums/status.enum';

export type ReportDocument = HydratedDocument<Report>;

@Schema({ timestamps: true })
export class Report {
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
    ref: 'User',
    required: true,
    autopopulate: { select: '-password' },
  })
  reportedUser: User;

  @Prop({ required: true, maxlength: 64, index: 'text' })
  reason: string;

  @Prop({ maxlength: 1028, index: 'text' })
  details: string;

  @Prop({
    default: ReportStatusEnum.SUBMITTED,
    required: true,
    index: true,
    enum: Object.values(ReportStatusEnum),
  })
  status: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  resolvedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
