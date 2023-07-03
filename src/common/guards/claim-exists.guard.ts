import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim } from '../../claims/schemas/claim.schema';

@Injectable()
export class DoesClaimExist implements CanActivate {
  constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const claim = await this.claimModel.findOne({ _id: params.claimId });
    if (claim) {
      return true;
    }
    throw new NotFoundException('Claim not found');
  }
}
