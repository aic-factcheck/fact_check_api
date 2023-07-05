import { _ } from 'lodash';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Invalid ObjectId',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (_.includes(request.user.roles, 'admin')) return true;

    return request.user._id.equals(userId);
  }
}
