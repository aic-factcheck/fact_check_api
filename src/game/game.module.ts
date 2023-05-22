import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Reputation, ReputationSchema } from './schemas/reputation.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reputation.name, schema: ReputationSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [
    MongooseModule.forFeature([
      { name: Reputation.name, schema: ReputationSchema },
    ]),
  ],
})
export class GameModule {}
