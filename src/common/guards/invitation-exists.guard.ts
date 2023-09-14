import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invitation } from '../../invitations/schemas/invitation.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class InvitationExistsGuard implements CanActivate {
  constructor(
    @InjectModel(Invitation.name) private invModel: Model<Invitation>,
    private readonly i18nService: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    const inv = await this.invModel.findOne({ invitedEmail: body.email });
    if (inv) {
      return true;
    }
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: this.i18nService.t('errors.user_not_invited', {
        lang: I18nContext.current()?.lang,
      }),
    });
  }
}
