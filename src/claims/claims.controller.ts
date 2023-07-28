import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { NullableType } from '../common/types/nullable.type';
import { PaginationParams } from '../common/types/pagination-params';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ClaimsService } from './claims.service';
import { Claim } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { Public } from '../auth/decorators/public-route.decorator';
import { ClaimResponseType } from './types/claim-response.type';
import { DoesArticleExist } from '../common/guards/article-exists.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Claims')
@Controller({
  version: '1',
})
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
export class ClaimsController {
  constructor(private readonly claimService: ClaimsService) {}

  @Post()
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(DoesArticleExist)
  create(
    @Body() createArticleDto: CreateClaimDto,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
  ): Promise<Claim> {
    return this.claimService.create(articleId, user, createArticleDto);
  }

  @Get()
  @Public()
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @CacheTTL(5)
  async list(
    @Query() { page, perPage }: PaginationParams,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
  ): Promise<ClaimResponseType[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.claimService.findManyWithPagination(
      articleId,
      page,
      perPage,
      user,
    );
  }

  @Get(':claimId')
  @Public()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.OK)
  @CacheTTL(60)
  async findOne(
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
  ): Promise<NullableType<ClaimResponseType>> {
    return this.claimService.findOne(articleId, claimId, user);
  }

  @Patch(':claimId')
  @ApiOperation({ summary: 'Updates specified fields of existing Article' })
  @ApiBody({ type: CreateClaimDto })
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Body() articleDto: CreateClaimDto,
    @LoggedUser() user: User,
  ): Promise<NullableType<Claim>> {
    return this.claimService.update(claimId, articleDto, user);
  }

  @Delete(':claimId')
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
    @LoggedUser() user: User,
  ) {
    return this.claimService.delete(user, articleId, claimId);
  }
}
