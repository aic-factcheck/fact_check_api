import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { NullableType } from '../utils/types/nullable.type';
import { PaginationParams } from '../utils/types/pagination-params';
import { ParseObjectIdPipe } from '../utils/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { Public } from '../auth/decorators/public-route.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './schemas/review.schema';
import MongooseClassSerializerInterceptor from '../utils/interceptors/mongoose-class-serializer.interceptor';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller({
  version: '1',
})
@UseInterceptors(MongooseClassSerializerInterceptor(Review))
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
  ): Promise<Review> {
    return this.reviewsService.create(
      articleId,
      claimId,
      user,
      createReviewDto,
    );
  }

  @Get()
  @Public()
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async list(
    @Query() { page, perPage }: PaginationParams,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
  ): Promise<Review[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.reviewsService.findManyWithPagination(
      articleId,
      claimId,
      page,
      perPage,
      user,
    );
  }

  @Get(':reviewId')
  @Public()
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @ApiParam({ name: 'reviewId', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Param('reviewId', new ParseObjectIdPipe()) reviewId: Types.ObjectId,
  ): Promise<NullableType<Review>> {
    return this.reviewsService.findOne({
      _id: reviewId,
      claim: claimId,
      article: articleId,
    });
  }

  @Put(':reviewId')
  @ApiOperation({ summary: 'Replaces the whole Article document by a new one' })
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @ApiParam({ name: 'reviewId', type: String })
  @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @HttpCode(HttpStatus.OK)
  replace(
    @Body() createReviewDto: CreateReviewDto,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Param('reviewId', new ParseObjectIdPipe()) reviewId: Types.ObjectId,
  ): Promise<NullableType<Review>> {
    return this.reviewsService.replace(
      articleId,
      claimId,
      reviewId,
      createReviewDto,
      user,
    );
  }

  @Delete(':reviewId')
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @ApiParam({ name: 'reviewId', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Param('reviewId', new ParseObjectIdPipe()) reviewId: Types.ObjectId,
  ) {
    return this.reviewsService.delete(articleId, claimId, reviewId, user);
  }
}