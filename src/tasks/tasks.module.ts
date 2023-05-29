import { Module } from '@nestjs/common';
import { EvaluateClaimsService } from './evaluate-claims.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Claim, ClaimSchema } from '../claims/schemas/claim.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  providers: [EvaluateClaimsService],
})
export class TasksModule {}
