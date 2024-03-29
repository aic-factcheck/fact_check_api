import { _ } from 'lodash';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { NullableType } from '../common/types/nullable.type';
import { ReportStatusEnum } from './enums/status.enum';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ReportsService {
  constructor(
    private readonly i18nService: I18nService,
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createDto: CreateReportDto, loggedUser: User): Promise<Report> {
    const user = await this.userModel.findById(createDto.reportedUser);
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.i18nService.t('errors.user_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }
    const report: ReportDocument = new this.reportModel(
      _.assign(createDto, {
        author: loggedUser._id,
      }),
    );
    return report.save();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(
    page = 1,
    perPage = 20,
    status: ReportStatusEnum,
  ): Promise<Report[]> {
    // const mostReportedUsers = await this.reportModel
    //   .aggregate([{ $match: { isOpen: true } }])
    //   .group({
    //     _id: 'reportedUser',
    //     nReports: { $count: {} },
    //   })
    //   .skip(perPage * (page - 1))
    //   .limit(perPage); // TODO ?

    return this.reportModel
      .find({ status: status })
      .sort({ createdAt: 'desc' })
      .skip(perPage * (page - 1))
      .limit(perPage);
  }

  async findOne(_id: Types.ObjectId): Promise<NullableType<Report>> {
    const report = await this.reportModel.findById({ _id });
    if (!report) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.i18nService.t('errors.report_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }
    return report;
  }

  async update(
    _id: Types.ObjectId,
    updateReportDto: UpdateReportDto,
  ): Promise<NullableType<Report>> {
    const updated: Report | null = await this.reportModel.findByIdAndUpdate(
      _id,
      updateReportDto,
      {
        returnOriginal: false,
      },
    );
    if (!updated) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.i18nService.t('errors.report_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }
    return updated;
  }
}
