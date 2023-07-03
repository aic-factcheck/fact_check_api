import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NullableType } from '../common/types/nullable.type';
import { PaginationParams } from '../common/types/pagination-params';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { Public } from '../auth/decorators/public-route.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DoesArticleExist } from '../common/guards/article-exists.guard';
import { DoesClaimExist } from '../common/guards/claim-exists.guard';

@ApiTags('Reviews')
@Controller({
  version: '1',
})
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(DoesArticleExist, DoesClaimExist)
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
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @ApiParam({ name: 'reviewId', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @LoggedUser() user: User | null,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Param('reviewId', new ParseObjectIdPipe()) reviewId: Types.ObjectId,
  ): Promise<NullableType<Review>> {
    return this.reviewsService.findOne(articleId, claimId, reviewId, user);
  }

  @Patch(':reviewId')
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @ApiParam({ name: 'reviewId', type: String })
  @HttpCode(HttpStatus.OK)
  update(
    @Body() updateReviewDto: UpdateReviewDto,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Param('reviewId', new ParseObjectIdPipe()) reviewId: Types.ObjectId,
  ): Promise<NullableType<Review>> {
    return this.reviewsService.update(
      articleId,
      claimId,
      reviewId,
      updateReviewDto,
      user,
    );
  }

  @Delete(':reviewId')
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
