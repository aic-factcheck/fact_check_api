import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { PaginationParams } from '../common/types/pagination-params';
import { SearchService } from './search.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public-route.decorator';

@ApiTags('Search')
@Controller({
  path: 'search',
  version: '1',
})
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'text', required: true, type: String, example: 'Jo Mirek' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  searchUsers(
    @Query() { page, perPage }: PaginationParams,
    @Query('text') text: string,
  ) {
    return this.searchService.findUsers(page, perPage, text);
  }

  @Get('claims')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'text',
    required: true,
    type: String,
    example: 'Lorem ipsum claim search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  searchClaims(
    @LoggedUser() user: User | null,
    @Query() { page, perPage }: PaginationParams,
    @Query('text') text: string,
  ) {
    return this.searchService.findClaims(page, perPage, text, user);
  }

  @Get('articles')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'text',
    required: true,
    type: String,
    example: 'Lorem ipsum article search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  searchArticles(
    @LoggedUser() user: User | null,
    @Query() { page, perPage }: PaginationParams,
    @Query('text') text: string,
  ) {
    return this.searchService.findArticles(page, perPage, text, user);
  }
}
