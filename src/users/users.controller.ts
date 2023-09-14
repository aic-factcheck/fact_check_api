import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  UseInterceptors,
  SerializeOptions,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../common/types/nullable.type';
import MongooseClassSerializerInterceptor from '../common/interceptors/mongoose-class-serializer.interceptor';
import { PaginationParams } from '../common/types/pagination-params';
import { Roles } from '../auth/decorators/roles.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { ReplaceUserDto } from './dto/replace-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoggedUser } from './decorators/logged-user.decorator';
import { Public } from '../auth/decorators/public-route.decorator';
import { Article } from '../articles/schemas/article.schema';
import { Claim } from '../claims/schemas/claim.schema';
import { Review } from '../reviews/schemas/review.schema';
import { Report } from '../reports/schemas/report.schema';
import { SelfOrAdminGuard } from '../common/guards/self-or-admin.guard';
import { BaseController } from '../common/helpers/base-controller';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Post()
  @SerializeOptions({ groups: ['admin'] })
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  @SerializeOptions({ groups: ['admin'] })
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  async list(@Query() { page, perPage }: PaginationParams): Promise<User[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.usersService.findManyWithPagination(page, perPage);
  }

  @Get(':userId')
  @Public()
  @SerializeOptions({ groups: ['admin'] })
  @ApiParam({ name: 'userId', type: String })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  findOne(
    @Param('userId', new ParseObjectIdPipe()) _id: Types.ObjectId,
  ): Promise<NullableType<User>> {
    return this.usersService.findOne({ _id });
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Updates specified fields of existing user' })
  @ApiBody({ type: ReplaceUserDto })
  @ApiParam({ name: 'userId', type: String })
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @UseGuards(SelfOrAdminGuard)
  update(
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
    @Body() userDto: UpdateUserDto,
    @LoggedUser() user: User,
  ): Promise<NullableType<User>> {
    return this.usersService.update(userId, user, userDto);
  }

  // @Put(':userId')
  // @ApiOperation({ summary: 'Replaces the whole user document by a new one' })
  // @ApiParam({ name: 'userId', type: String })
  // @SerializeOptions({ groups: ['admin'] })
  // @Roles('admin')
  // @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(MongooseClassSerializerInterceptor(User))
  // replace(
  //   @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
  //   @Body() userDto: ReplaceUserDto,
  //   @LoggedUser() user: User,
  // ): Promise<NullableType<User>> {
  //   return this.usersService.replace(userId, user, userDto);
  // }

  @Delete(':userId')
  @ApiParam({ name: 'userId', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @UseGuards(SelfOrAdminGuard)
  async delete(
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
  ) {
    return this.usersService.delete(userId);
  }

  @Get(':userId/articles')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async listUserArticles(
    @Query() { page, perPage }: PaginationParams,
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
    // @LoggedUser() user: User,
  ): Promise<Article[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.usersService.findArticlesWithPagination(page, perPage, userId);
  }

  @Get(':userId/claims')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async listUserClaims(
    @Query() { page, perPage }: PaginationParams,
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
    // @LoggedUser() user: User,
  ): Promise<Claim[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.usersService.findClaimsWithPagination(page, perPage, userId);
  }

  @Get(':userId/reviews')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async listUserReviews(
    @Query() { page, perPage }: PaginationParams,
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
    // @LoggedUser() user: User,
  ): Promise<Review[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.usersService.findReviewsWithPagination(page, perPage, userId);
  }

  @Get(':userId/reports')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async listUserReports(
    @Query() { page, perPage }: PaginationParams,
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
  ): Promise<Report[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.usersService.findReportsWithPagination(page, perPage, userId);
  }

  @Post(':userId/ban')
  @Roles('admin')
  @ApiParam({ name: 'userId', type: String })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  banUser(
    @Param('userId', new ParseObjectIdPipe()) userId: Types.ObjectId,
    @LoggedUser() loggedUser: User,
  ): Promise<User> {
    return this.usersService.ban(userId, loggedUser);
  }
}
