import { Controller } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../common/helpers/base-controller';

@ApiTags('Game')
@Controller({
  version: '1',
  path: 'game',
})
export class GameController extends BaseController {
  constructor(private readonly gameService: GameService) {
    super();
  }
}
