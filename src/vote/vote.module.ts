import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { GameModule } from '../game/game.module';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';
import { BullModule } from '@nestjs/bull';
import { VOTES_QUEUE_NAME } from './vote.constants';
import { VoteQueueProcessor } from './vote.processor';

@Module({
  imports: [
    SharedModelsModule,
    GameModule,
    BullModule.registerQueue({ name: VOTES_QUEUE_NAME }),
  ],
  controllers: [VoteController],
  providers: [VoteService, VoteQueueProcessor],
  exports: [],
})
export class VoteModule {}
