import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Claim } from '../../claims/schemas/claim.schema';

@Injectable()
export class DoesClaimExist implements CanActivate {
  constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;

    if (!mongoose.Types.ObjectId.isValid(params.claimId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Invalid ObjectId',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const claim = await this.claimModel.findOne({ _id: params.claimId });
    if (claim) {
      return true;
    }
    throw new NotFoundException('Claim not found');
  }
}
