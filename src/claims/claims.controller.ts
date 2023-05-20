import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  // Patch,
  // Put,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  // ApiOperation,
  // ApiBody,
} from '@nestjs/swagger';
import { NullableType } from '../utils/types/nullable.type';
import { PaginationParams } from '../utils/types/pagination-params';
import { ParseObjectIdPipe } from '../utils/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ClaimsService } from './claims.service';
import { Claim } from './schemas/claim.schema';
import { CreateClaimDto } from './dto/create-claim.dto';
import { Public } from '../auth/decorators/public-route.decorator';
import MongooseClassSerializerInterceptor from '../utils/interceptors/mongoose-class-serializer.interceptor';

@ApiTags('Claims')
@Controller({
  version: '1',
})
@UseInterceptors(MongooseClassSerializerInterceptor(Claim))
export class ClaimsController {
  constructor(private readonly claimService: ClaimsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createArticleDto: CreateClaimDto,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
  ): Promise<Claim> {
    return this.claimService.create(articleId, user, createArticleDto);
  }

  @Get()
  @Public()
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async list(
    @Query() { page, perPage }: PaginationParams,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
  ): Promise<Claim[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.claimService.findManyWithPagination(articleId, page, perPage);
  }

  @Get(':claimId')
  @Public()
  @ApiBearerAuth()
  @ApiParam({ name: 'articleId', type: String })
  @ApiParam({ name: 'claimId', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('claimId', new ParseObjectIdPipe()) claimId: Types.ObjectId,
    @LoggedUser() user: User,
    @Param('articleId', new ParseObjectIdPipe()) articleId: Types.ObjectId,
  ): Promise<NullableType<Claim>> {
    return this.claimService.findOne({ _id: claimId, article: articleId });
  }

  // @Patch(':id')
  // @ApiBearerAuth()
  // @ApiParam({
  //   name: 'articleId',
  //   type: String,
  // })
  // @ApiOperation({ summary: 'Updates specified fields of existing Article' })
  // @ApiBody({ type: ReplaceClaimDto })
  // @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  // @HttpCode(HttpStatus.OK)
  // update(
  //   @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
  //   @Body() articleDto: UpdateArticleDto,
  // ): Promise<NullableType<Claim>> {
  //   return this.claimService.update(_id, articleDto);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Replaces the whole Article document by a new one' })
  // @ApiBearerAuth()
  // @ApiParam({
  //   name: 'articleId',
  //   type: String,
  // })
  // @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  // @HttpCode(HttpStatus.OK)
  // replace(
  //   @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
  //   @Body() articleDto: ReplaceClaimDto,
  //   @LoggedUser() user: User,
  // ): Promise<NullableType<Claim>> {
  //   return this.claimService.replace(_id, user, articleDto);
  // }

  @Delete(':claimId')
  @ApiBearerAuth()
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
