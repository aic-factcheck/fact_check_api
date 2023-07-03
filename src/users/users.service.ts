import { _, omit } from 'lodash';
import { Model, Types } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../common/types/nullable.type';
import { UpdateUserDto } from './dto/update-user.dto';
// import { ReplaceUserDto } from './dto/replace-user.dto';
import { Article } from '../articles/schemas/article.schema';
import { Claim } from '../claims/schemas/claim.schema';
import { Review } from '../reviews/schemas/review.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser: UserDocument = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findOne(query: object): Promise<NullableType<User>> {
    return this.userModel.findOne(query);
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    return this.userModel.findOne({ email });
  }

  async findById(_id: Types.ObjectId): Promise<NullableType<User>> {
    return this.userModel.findById(_id);
  }

  async findManyWithPagination(page = 1, perPage = 20): Promise<User[]> {
    return this.userModel
      .find()
      .limit(perPage)
      .skip(perPage * (page - 1));
  }

  async update(
    _id: Types.ObjectId,
    loggedUser: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const ommitRoles: string = _.includes(loggedUser.roles, 'admin')
      ? ''
      : 'roles';
    updateUserDto = omit(updateUserDto, ommitRoles);

    const updatedUser: User | null = await this.userModel.findByIdAndUpdate(
      _id,
      updateUserDto,
      {
        returnOriginal: false,
      },
    );
    if (!updatedUser) {
      throw new NotFoundException(`User #${_id} not found`);
    }
    return updatedUser;
  }

  // async replace(
  //   _id: Types.ObjectId,
  //   user: User,
  //   userDto: ReplaceUserDto,
  // ): Promise<User> {
  //   if (!_.includes(user.roles, 'admin')) userDto = omit(userDto, 'roles');

  //   return this.userModel.findByIdAndUpdate(_id, userDto, {
  //     override: true,
  //     upsert: true,
  //     returnOriginal: false,
  //   });
  // }

  async delete(userId: Types.ObjectId): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return deletedUser;
  }

  async ban(idToBeBanned: Types.ObjectId, loggedUser: User): Promise<User> {
    const bannedUser = await this.userModel.findById(idToBeBanned);
    if (!bannedUser) {
      throw new NotFoundException(`User #${idToBeBanned} not found`);
    }
    throw new NotImplementedException('Ban not yet implemented');
    // TODO ban all his resources
    // return bannedUser;
  }

  async findArticlesWithPagination(
    page = 1,
    perPage = 20,
    authorId: Types.ObjectId,
  ): Promise<Article[]> {
    console.log(await this.articleModel.find());
    return this.articleModel
      .find({ author: authorId })
      .limit(perPage)
      .skip(perPage * (page - 1));
  }

  async findClaimsWithPagination(
    page = 1,
    perPage = 20,
    authorId: Types.ObjectId,
  ): Promise<Claim[]> {
    return this.claimModel
      .find({ author: authorId })
      .limit(perPage)
      .skip(perPage * (page - 1));
  }

  async findReviewsWithPagination(
    page = 1,
    perPage = 20,
    authorId: Types.ObjectId,
  ): Promise<Review[]> {
    return this.reviewModel
      .find({ author: authorId })
      .limit(perPage)
      .skip(perPage * (page - 1));
  }
}
