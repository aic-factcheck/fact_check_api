import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Claim } from '../../claims/schemas/claim.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class DoesClaimExist implements CanActivate {
  constructor(
    @InjectModel(Claim.name) private claimModel: Model<Claim>,
    private readonly i18nService: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    if (!mongoose.Types.ObjectId.isValid(params.claimId)) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18nService.t('errors.invalid_objectid', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    const claim = await this.claimModel.findOne({ _id: params.claimId });
    if (claim) {
      return true;
    }
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: this.i18nService.t('errors.claim_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    });
  }
}
