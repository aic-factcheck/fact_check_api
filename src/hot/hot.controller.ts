import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { HotService } from './hot.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public-route.decorator';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { PaginationParams } from '../utils/types/pagination-params';
import MongooseClassSerializerInterceptor from '../utils/interceptors/mongoose-class-serializer.interceptor';

@ApiTags('Hot')
@Controller({
  path: 'hot',
  version: '1',
})
@ApiBearerAuth()
export class HotController {
  constructor(private readonly hotService: HotService) {}

  @Get('articles')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  getHottestArticles(
    @LoggedUser() user: User | null,
    @Query() { page, perPage }: PaginationParams,
  ) {
    return this.hotService.findArticles(page, perPage, user, {});
  }

  @Get('claims')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  getHottestClaims(
    @LoggedUser() user: User | null,
    @Query() { page, perPage }: PaginationParams,
  ) {
    return this.hotService.findClaims(page, perPage, user, {});
  }

  @Get('users')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  getHottestUsers(
    @LoggedUser() user: User | null,
    @Query() { page, perPage }: PaginationParams,
  ) {
    return this.hotService.findUsers(page, perPage, user, {});
  }
}
