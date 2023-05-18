import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, ObjectId, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { Article } from './article.schema';

export type SavedArticleDocument = HydratedDocument<SavedArticle>;

@Schema({ timestamps: true })
export class SavedArticle {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  addedBy: User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Article',
    required: true,
  })
  articleId: Article;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const SavedArticleSchema = SchemaFactory.createForClass(SavedArticle);
