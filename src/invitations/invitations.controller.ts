import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateInvitationDto } from './dto/create-invititation.dto';
import { Invitation } from './schemas/invitation.schema';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from '../common/types/pagination-params';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { NullableType } from '../common/types/nullable.type';
import { Types } from 'mongoose';

@ApiTags('Invitations')
@Controller({
  path: 'invitations',
  version: '1',
})
@ApiBearerAuth()
export class InvitationsController {
  constructor(private readonly invService: InvitationsService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDto: CreateInvitationDto,
    @LoggedUser() user,
  ): Promise<Invitation> {
    return this.invService.create(createDto, user);
  }

  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  async list(
    @Query() { page, perPage }: PaginationParams,
  ): Promise<Invitation[]> {
    if (perPage > 50) {
      perPage = 50;
    }
    return this.invService.findManyWithPagination(page, perPage);
  }

  @Get(':invitationId')
  @Roles('admin')
  @ApiParam({ name: 'invitationId', type: String })
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('invitationId', new ParseObjectIdPipe()) _id: Types.ObjectId,
  ): Promise<NullableType<Invitation>> {
    return this.invService.findById(_id);
  }

  @Delete(':invitationId')
  @Roles('admin')
  @ApiParam({ name: 'invitationId', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('invitationId', new ParseObjectIdPipe())
    invitationId: Types.ObjectId,
  ) {
    return this.invService.delete(invitationId);
  }
}
