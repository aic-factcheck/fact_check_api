import { _ } from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Invitation, InvitationDocument } from './schemas/invitation.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { randomBytes } from 'crypto';
import { CreateInvitationDto } from './dto/create-invititation.dto';
import { NullableType } from '../common/types/nullable.type';
import { MailService } from '../shared/mail/mail.service';
import { GameService } from '../game/game.service';
import { GameAtionEnum } from '../game/enums/reputation.enum';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Invitation.name) private invModel: Model<Invitation>,
    private readonly gameService: GameService,
    private mailService: MailService,
  ) {}

  async create(
    createDto: CreateInvitationDto,
    loggedUser: User,
  ): Promise<Invitation> {
    const code = randomBytes(4).toString('hex');
    const newInv: InvitationDocument = new this.invModel(
      _.assign(createDto, { author: loggedUser._id, code }),
    );
    this.gameService.addReputation(loggedUser, GameAtionEnum.INVITE);
    await this.mailService.sendUserInvitation(createDto.invitedEmail, code);
    return newInv.save();
  }

  async findManyWithPagination(page = 1, perPage = 20): Promise<Invitation[]> {
    return this.invModel
      .find()
      .limit(perPage)
      .skip(perPage * (page - 1));
  }

  async findById(_id: Types.ObjectId): Promise<NullableType<Invitation>> {
    return this.invModel.findById(_id);
  }

  async delete(_id: Types.ObjectId) {
    const deletedInv = await this.invModel.findByIdAndDelete(_id);

    if (!deletedInv) {
      throw new NotFoundException(`Invitation  #${_id} not found`);
    }
  }
}
