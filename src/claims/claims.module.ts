import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { GameModule } from '../game/game.module';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule, GameModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
