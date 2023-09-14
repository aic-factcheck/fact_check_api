import { _ } from 'lodash';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
  mixin,
} from '@nestjs/common';
import { Claim } from '../schemas/claim.schema';
import { ClaimsService } from '../claims.service';
import mongoose from 'mongoose';
import { I18nContext, I18nService } from 'nestjs-i18n';

export const IsClaimOwnerGuard = (paramId: string) => {
  @Injectable()
  class IsClaimOwnerMixin implements CanActivate {
    constructor(
      @Inject(ClaimsService) public claimService: ClaimsService,
      readonly i18nService: I18nService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const _id: string = request.params[paramId];

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: this.i18nService.t('errors.invalid_objectid', {
            lang: I18nContext.current()?.lang,
          }),
        });
      }

      if (_.includes(request.user.roles, 'admin')) return true;

      const claim: Claim | null = await this.claimService.findByQuery({ _id });
      if (!claim) return false;

      if (claim.author._id !== request.user._id) return false;

      return true;
    }
  }

  const guard = mixin(IsClaimOwnerMixin);
  return guard;
};
