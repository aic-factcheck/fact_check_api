import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  UseInterceptors,
  Patch,
  Put,
  Delete,
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
import { NullableType } from '../utils/types/nullable.type';
import MongooseClassSerializerInterceptor from '../utils/interceptors/mongoose-class-serializer.interceptor';
import { PaginationParams } from '../utils/types/pagination-params';
import { ParseObjectIdPipe } from '../utils/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { Article } from './schemas/article.schema';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ReplaceArticleDto } from './dto/replace-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Public } from '../auth/decorators/public-route.decorator';

@ApiTags('Articles')
@Controller({
  path: 'articles',
  version: '1',
})
@UseInterceptors(MongooseClassSerializerInterceptor(Article))
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createArticleDto: CreateArticleDto,
    @LoggedUser() user: User,
  ): Promise<Article> {
    return this.articlesService.create(user, createArticleDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async list(@Query() { page, limit }: PaginationParams): Promise<Article[]> {
    if (limit > 50) {
      limit = 50;
    }
    return await this.articlesService.findManyWithPagination(page, limit);
  }

  @Get(':id')
  @Public()
  @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
  ): Promise<NullableType<Article>> {
    return this.articlesService.findOne({ _id });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates specified fields of existing Article' })
  @ApiBody({ type: ReplaceArticleDto })
  @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @Body() articleDto: UpdateArticleDto,
  ): Promise<NullableType<Article>> {
    return this.articlesService.update(_id, articleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replaces the whole Article document by a new one' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @HttpCode(HttpStatus.OK)
  replace(
    @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @Body() articleDto: ReplaceArticleDto,
    @LoggedUser() user: User,
  ): Promise<NullableType<Article>> {
    return this.articlesService.replace(_id, user, articleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId) {
    return this.articlesService.delete(_id);
  }
}
