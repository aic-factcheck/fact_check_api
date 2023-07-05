import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/schemas/user.schema';
import { Article } from '../../articles/schemas/article.schema';

export type SavedArticleDocument = HydratedDocument<SavedArticle>;

@Schema({ timestamps: true })
export class SavedArticle {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Article',
    required: true,
  })
  articleId: Article;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const SavedArticleSchema = SchemaFactory.createForClass(SavedArticle);
