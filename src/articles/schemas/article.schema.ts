import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
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
    index: true,
  })
  author: User;

  @Prop({ required: true, maxlength: 512, index: 'text' })
  title: string;

  @Prop({ required: true, maxlength: 32896, index: 'text' })
  text: string;

  @Prop({ type: [String], default: [], index: true })
  categories: string[];

  @Prop({ required: true, maxlength: 512, index: 'text', unique: true })
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

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

const articleSchema = SchemaFactory.createForClass(Article);
// eslint-disable-next-line @typescript-eslint/no-var-requires
articleSchema.plugin(require('mongoose-autopopulate'));

export { articleSchema as ArticleSchema };
