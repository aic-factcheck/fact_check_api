import { _ } from 'lodash';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  constructor(private readonly i18nService: I18nService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18nService.t('errors.invalid_objectid', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    if (_.includes(request.user.roles, 'admin')) return true;

    return request.user._id.equals(userId);
  }
}
