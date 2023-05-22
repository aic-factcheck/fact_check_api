import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    GameModule,
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    ClaimsService,
  ],
})
export class ClaimsModule {}
