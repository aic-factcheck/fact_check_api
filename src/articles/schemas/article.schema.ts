import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';

/**
 * Article types
 */
const articleTypes = ['article', 'tv', 'radio', 'other'];

/**
 * Languages
 */
const languages = ['cz', 'sk', 'en'];

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: { select: '-password' },
  })
  addedBy: User;

  @Prop({ required: true, maxlength: 512, index: true })
  title: string;

  @Prop({ required: true, maxlength: 16448, index: true })
  text: string;

  @Prop({ type: [Types.ObjectId], default: [] }) // TODO ref claim
  claims: Types.ObjectId[];

  @Prop({ required: true, maxlength: 512, index: true })
  sourceUrl: string;

  @Prop({ default: 'article', enum: articleTypes })
  sourceType: string;

  @Prop({ required: true, default: 'en', index: true, enum: languages })
  lang: string;

  @Prop({ default: 0 })
  nNegativeVotes: number;

  @Prop({ default: 0 })
  nPositiveVotes: number;

  @Prop({ default: 0 })
  nSaved: number;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
