import { Injectable } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { GameAtionEnum, getRepForAction } from './enums/reputation.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Reputation } from './schemas/reputation.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class GameService {
  private constC = 0.25;

  constructor(
    @InjectModel(Reputation.name) private repModel: Model<Reputation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  getLevel = (user: User): number => {
    const level = Math.floor(this.constC * Math.sqrt(user.reputation));
    return level;
  };

  getNextLevelExp = (level: number): number => {
    const rep = ((level + 1) / this.constC) ** 2;
    return rep;
  };

  async addReputation(
    user: User,
    action: GameAtionEnum,
    referencedId: Types.ObjectId | null = null,
  ) {
    const points = getRepForAction(action);
    const rep = new this.repModel({
      user: user._id,
      action,
      points,
      referencedId,
    });

    await rep.save();
    return this.userModel.findByIdAndUpdate(user._id, {
      $inc: { reputation: points },
      level: this.getLevel(user),
    });
  }

  getProfile(user: User) {
    return `This action returns a #${user._id} game`;
  }
}
