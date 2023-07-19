import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invitation } from '../../invitations/schemas/invitation.schema';

@Injectable()
export class InvitationExistsGuard implements CanActivate {
  constructor(
    @InjectModel(Invitation.name) private invModel: Model<Invitation>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    console.log(body);

    const inv = await this.invModel.findOne({ invitedEmail: body.email });
    if (inv) {
      return true;
    }
    throw new NotFoundException('Invitation for user does not exists');
  }
}
