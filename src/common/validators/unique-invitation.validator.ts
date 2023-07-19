import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { Invitation } from '../../invitations/schemas/invitation.schema';

@Injectable()
@ValidatorConstraint({ name: 'UniqueInvitationValidator', async: true })
export class UniqueInvitationValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(Invitation.name) private invModel: Model<Invitation>,
  ) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const filter = {};
    if (!args) return false;

    filter[args.property] = value;
    const count = await this.invModel.count(filter);
    return !count;
  }

  defaultMessage(args: ValidationArguments) {
    return `Invitation for ${args[0]} already exists`;
  }
}
