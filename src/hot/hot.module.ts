import { Module } from '@nestjs/common';
import { HotService } from './hot.service';
import { HotController } from './hot.controller';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule],
  controllers: [HotController],
  providers: [HotService],
})
export class HotModule {}
