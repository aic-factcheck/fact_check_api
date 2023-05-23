import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';

@ApiTags('Game')
@Controller({
  version: '1',
  path: 'game',
})
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('/profile/info')
  @HttpCode(HttpStatus.OK)
  getGameProfile(@LoggedUser() user: User) {
    return this.gameService.getProfile(user);
  }
}
