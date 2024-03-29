import {
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from '../common/interceptors/mongoose-class-serializer.interceptor';
import { PaginationParams } from '../common/types/pagination-params';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { Article } from '../articles/schemas/article.schema';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { SavedArticle } from './schemas/saved-article.schema';
import { SavedArticlesService } from './saved-articles.service';
import { BaseController } from '../common/helpers/base-controller';

@ApiTags('Save')
@Controller({
  path: 'save',
  version: '1',
})
@UseInterceptors(MongooseClassSerializerInterceptor(SavedArticle))
export class SavedArticlesController extends BaseController {
  constructor(private readonly service: SavedArticlesService) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiQuery({
    name: 'articleId',
    required: true,
    type: String,
    example: '646668d317d5093ad248a959',
  })
  create(
    @LoggedUser() user: User,
    @Query('articleId', ParseObjectIdPipe) articleId: Types.ObjectId,
  ): Promise<SavedArticle> {
    return this.service.save(user, articleId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async list(
    @Query() { page, perPage }: PaginationParams,
    @LoggedUser() user: User,
  ): Promise<Article[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.service.findManyWithPagination(user, page, perPage);
  }

  @Delete()
  @ApiQuery({
    name: 'articleId',
    required: true,
    type: String,
    example: '646668d317d5093ad248a959',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @LoggedUser() user: User,
    @Query('articleId', ParseObjectIdPipe) articleId: Types.ObjectId,
  ) {
    return this.service.unsave(user, articleId);
  }
}
