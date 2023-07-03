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
import { Article } from './schemas/article.schema';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ReplaceArticleDto } from './dto/replace-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Public } from '../auth/decorators/public-route.decorator';
import { ArticleResponseType } from './types/article-response.type';

@ApiTags('Articles')
@Controller({
  version: '1',
})
@ApiBearerAuth()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async list(
    @Query() { page, perPage }: PaginationParams,
    @LoggedUser() loggedUser: User,
  ): Promise<Article[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.articlesService.findManyWithPagination(
      loggedUser,
      page,
      perPage,
    );
  }

  @Get(':articleId')
  @Public()
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('articleId', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @LoggedUser() user: User,
  ): Promise<NullableType<ArticleResponseType>> {
    return this.articlesService.findOne(user, _id);
  }

  @Patch(':articleId')
  @ApiOperation({ summary: 'Updates specified fields of existing Article' })
  @ApiBody({ type: ReplaceArticleDto })
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('articleId', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @Body() articleDto: UpdateArticleDto,
    @LoggedUser() user: User,
  ): Promise<NullableType<Article>> {
    return this.articlesService.update(_id, user, articleDto);
  }

  @Delete(':articleId')
  @ApiParam({ name: 'articleId', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('articleId', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @LoggedUser() user: User,
  ) {
    return this.articlesService.delete(_id, user);
  }
}
