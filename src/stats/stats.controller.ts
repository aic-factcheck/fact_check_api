import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public-route.decorator';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { PaginationParams } from '../common/types/pagination-params';
import { Types } from 'mongoose';
import { CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Stats')
@Controller({
  version: '1',
  path: 'stats',
})
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'userId', required: false, type: String })
  @CacheTTL(20)
  userStats(
    @LoggedUser() loggedUser: User,
    @Query('userId') userId: Types.ObjectId | null,
  ) {
    return this.statsService.getUserStats(userId, loggedUser);
  }

  @Get('leaderboard')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @CacheTTL(60)
  leaderboard(@Query() { page, perPage }: PaginationParams) {
    return this.statsService.leaderboard(page, perPage);
  }
}
