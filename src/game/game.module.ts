import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Reputation, ReputationSchema } from './schemas/reputation.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reputation.name, schema: ReputationSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [
    MongooseModule.forFeature([
      { name: Reputation.name, schema: ReputationSchema },
    ]),
    GameService,
  ],
})
export class GameModule {}
