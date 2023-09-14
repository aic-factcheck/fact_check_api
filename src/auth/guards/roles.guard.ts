import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18nService: I18nService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Custom authentication logic here, establish session, etc
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return user;
    }
    const hasRole = () => user.roles.some((role) => roles.includes(role));
    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: this.i18nService.t('errors.unauthorized', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }
    if (!(user.roles && hasRole())) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: this.i18nService.t('errors.forbidden', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    if (user && user.roles && hasRole()) {
      return user;
    }
  }
}
