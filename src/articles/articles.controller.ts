import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
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
import { ArticleResponseType } from './interfaces/article-response.interface';

@ApiTags('Articles')
@Controller({
  path: 'articles',
  version: '1',
})
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
  @ApiBearerAuth()
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
    return this.articlesService.findManyWithPagination(user, page, perPage);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Public()
  @ApiParam({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @LoggedUser() user: User,
  ): Promise<NullableType<ArticleResponseType>> {
    return this.articlesService.findOne(user, _id);
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
