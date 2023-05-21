import { _ } from 'lodash';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  mixin,
} from '@nestjs/common';
import { Claim } from '../schemas/claim.schema';
import { ClaimsService } from '../claims.service';
import mongoose from 'mongoose';

export const IsClaimOwnerGuard = (paramId: string) => {
  @Injectable()
  class IsClaimOwnerMixin implements CanActivate {
    constructor(@Inject(ClaimsService) public claimService: ClaimsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const _id: string = request.params[paramId];

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Invalid ObjectId',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (_.includes(request.user.roles, 'admin')) return true;

      const claim: Claim | null = await this.claimService.findByQuery({ _id });
      if (!claim) return false;

      if (claim.addedBy._id !== request.user._id) return false;

      return true;
    }
  }

  const guard = mixin(IsClaimOwnerMixin);
  return guard;
};
