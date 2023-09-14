import { _, omit } from 'lodash';
import { Model, Types } from 'mongoose';
import {
  HttpStatus,
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
import { RefreshToken } from '../auth/schemas/refresh-token.schema';
import { Report } from '../reports/schemas/report.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name) private tokenModel: Model<RefreshToken>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private readonly i18nService: I18nService,
  ) {}

  private throwUserNotFoundException(): never {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: this.i18nService.t('errors.user_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    });
  }

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

    const user: UserDocument | null = await this.userModel.findById(_id);

    if (!user) this.throwUserNotFoundException();

    _.assign(user, updateUserDto);
    return user.save();
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

  async delete(userId: Types.ObjectId) {
    await this.tokenModel.findOneAndDelete({ userId });
    const deletedUser = await this.userModel.findByIdAndDelete(userId);

    if (!deletedUser) this.throwUserNotFoundException();
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ban(idToBeBanned: Types.ObjectId, loggedUser: User): Promise<User> {
    const bannedUser = await this.userModel.findById(idToBeBanned);
    if (!bannedUser) this.throwUserNotFoundException();

    throw new NotImplementedException({
      statusCode: HttpStatus.NOT_IMPLEMENTED,
      message: this.i18nService.t('errors.not_implemented', {
        lang: I18nContext.current()?.lang,
      }),
    });
    // TODO ban all his resources
    // return bannedUser;
  }

  async findArticlesWithPagination(
    page = 1,
    perPage = 20,
    authorId: Types.ObjectId,
  ): Promise<Article[]> {
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

  async findReportsWithPagination(
    page = 1,
    perPage = 20,
    userId: Types.ObjectId,
  ): Promise<Report[]> {
    return this.reportModel
      .find({ reportedUser: userId })
      .limit(perPage)
      .skip(perPage * (page - 1));
  }
}
