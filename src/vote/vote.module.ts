import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { GameModule } from '../game/game.module';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule, GameModule],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [],
})
export class VoteModule {}
