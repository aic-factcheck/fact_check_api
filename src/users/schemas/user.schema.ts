import * as bcrypt from 'bcrypt';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exclude, Expose, Transform } from 'class-transformer';
import { SavedArticle } from '../../saved-articles/schemas/saved-article.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Expose()
  @Transform((params) => params.obj._id.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    minlength: 6,
    maxlength: 255,
    index: 'text',
  })
  email: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ required: true, index: 'text' })
  firstName: string;

  @Prop({ required: true, index: 'text' })
  lastName: string;

  @Prop({ type: [String], default: ['user'], required: true })
  roles: string[];

  @Prop()
  picture: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 0 })
  @Exclude()
  loginAttempts: number;

  @Prop()
  invitedBy: string;

  @Prop({ default: 0 })
  nReviews: number;

  @Prop({ default: 0 })
  nBeenVoted: number;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ type: [Types.ObjectId], ref: 'Article', default: [] })
  savedArticles: SavedArticle[];

  @Prop({ default: 1 })
  level: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});
