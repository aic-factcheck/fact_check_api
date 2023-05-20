import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
    ClaimsService,
  ],
})
export class ClaimsModule {}
