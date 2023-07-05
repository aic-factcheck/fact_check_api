import { Controller } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Game')
@Controller({
  version: '1',
  path: 'game',
})
@ApiBearerAuth()
export class GameController {
  constructor(private readonly gameService: GameService) {}
}
