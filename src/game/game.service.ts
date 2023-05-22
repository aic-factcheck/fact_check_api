import { Injectable } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class GameService {
  addReputation(user: User) {
    return 'This action adds a new game';
  }

  getProfile(user: User) {
    return `This action returns a #${user._id} game`;
  }
}
