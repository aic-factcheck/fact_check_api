import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { VoteObjectEnum } from './enums/vote.enum';
import { VoteJobResponseType } from './types/vote-job-response.type';

@ApiTags('Votes')
@Controller({
  version: '1',
  path: 'vote',
})
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiQuery({ name: 'id', type: String, example: '645cacbfa6693d8100b2d60a' })
  @ApiQuery({
    name: 'type',
    enum: VoteObjectEnum,
    required: true,
    example: VoteObjectEnum.ARTICLE,
  })
  vote(
    @Body() createVoteDto: CreateVoteDto,
    @LoggedUser() user: User,
    @Query('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query('type', new ParseEnumPipe(VoteObjectEnum)) type: VoteObjectEnum,
  ): Promise<VoteJobResponseType> {
    return this.voteService.create(id, type, createVoteDto, user);
  }
}
