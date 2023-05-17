import {
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Param,
  // UseInterceptors,
  UseGuards,
  Patch,
  Put,
  Delete,
  Res,
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
// import MongooseClassSerializerInterceptor from '../utils/interceptors/mongoose-class-serializer.interceptor';
import { PaginationParams } from '../utils/types/pagination-params';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ParseObjectIdPipe } from '../utils/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { Article } from './schemas/article.schema';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { ReplaceArticleDto } from './dto/replace-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Response } from 'express';
// import { AuthGuard } from '@nestjs/passport';

@ApiTags('Articles')
@Controller({
  path: 'articles',
  version: '1',
})
// @UseInterceptors(MongooseClassSerializerInterceptor(Article))
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createArticleDto: CreateArticleDto,
    @LoggedUser() user: User,
  ): Promise<Article> {
    console.log(user);
    return this.articlesService.create(user, createArticleDto);
  }

  @Get()
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
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
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
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
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
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', new ParseObjectIdPipe()) _id: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const deletedArticle = await this.articlesService.delete(_id);
      return res.status(HttpStatus.NO_CONTENT).json({
        message: 'Article deleted successfully',
        deletedArticle,
      });
    } catch (err) {
      return res.status(err.status).json(err.response);
    }
  }
}
