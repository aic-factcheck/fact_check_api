import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseEnumPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { HotService } from './hot.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public-route.decorator';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { PaginationParams } from '../common/types/pagination-params';
import MongooseClassSerializerInterceptor from '../common/interceptors/mongoose-class-serializer.interceptor';
import { SortByEnum } from './enums/sort-by.enum';
import { DurationLimitEnum } from './enums/duration.enum';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Hot')
@Controller({
  path: 'hot',
  version: '1',
})
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@CacheTTL(60)
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
    return this.hotService.findArticles(page, perPage, user);
  }

  @Get('claims')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'sortBy',
    required: true,
    enum: SortByEnum,
    example: SortByEnum.POSITIVE_VOTES_ASC,
  })
  @ApiQuery({
    name: 'duration',
    required: true,
    enum: DurationLimitEnum,
    example: DurationLimitEnum.WEEK,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  getHottestClaims(
    @LoggedUser() user: User | null,
    @Query() { page, perPage }: PaginationParams,
    @Query('sortBy', new ParseEnumPipe(SortByEnum)) sortBy: SortByEnum,
    @Query('duration', new ParseEnumPipe(DurationLimitEnum))
    duration: DurationLimitEnum,
  ) {
    return this.hotService.findClaims(page, perPage, user, sortBy, duration);
  }

  @Get('users')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  getHottestUsers(@Query() { page, perPage }: PaginationParams) {
    return this.hotService.findUsers(page, perPage);
  }
}
