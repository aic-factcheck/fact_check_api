import { Module } from '@nestjs/common';
import { EvaluateClaimsService } from './evaluate-claims.service';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule],
  providers: [EvaluateClaimsService],
})
export class TasksModule {}
