import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
