import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from '../users/decorators/logged-user.decorator';
import { User } from '../users/schemas/user.schema';
import { Report } from './schemas/report.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationParams } from '../common/types/pagination-params';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { Types } from 'mongoose';
import { ReportStatusEnum } from './enums/status.enum';
import { NullableType } from '../common/types/nullable.type';

@ApiTags('Reports')
@Controller({
  version: '1',
  path: 'reports',
})
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReportDto: CreateReportDto, @LoggedUser() user: User) {
    return this.reportsService.create(createReportDto, user);
  }

  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status',
    enum: ReportStatusEnum,
    example: ReportStatusEnum.SUBMITTED,
  })
  async findAll(
    @Query() { page, perPage }: PaginationParams,
    @Query('status', new ParseEnumPipe(ReportStatusEnum)) status,
  ): Promise<Report[]> {
    return this.reportsService.findAll(page, perPage, status);
  }

  @Get(':reportId')
  @Roles('admin')
  @ApiParam({ name: 'reportId', type: String })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('reportId', new ParseObjectIdPipe()) reportId: Types.ObjectId,
  ): Promise<NullableType<Report>> {
    return this.reportsService.findOne(reportId);
  }

  @Patch(':reportId')
  @Roles('admin')
  @ApiParam({ name: 'reportId', type: String })
  @HttpCode(HttpStatus.CREATED)
  async update(
    @Param('reportId', new ParseObjectIdPipe()) reportId: Types.ObjectId,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.update(reportId, updateReportDto);
  }
}
