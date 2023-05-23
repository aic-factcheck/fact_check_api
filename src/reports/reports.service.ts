import { _ } from 'lodash';
import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { NullableType } from '../common/types/nullable.type';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private reportModel: Model<Report>) {}

  create(createDto: CreateReportDto, loggedUser: User): Promise<Report> {
    const report: ReportDocument = new this.reportModel(
      _.assign(createDto, {
        addedBy: loggedUser._id,
      }),
    );
    return report.save();
  }

  findAll(
    page = 1,
    perPage = 20,
    user: User,
    openedOnly = true,
  ): Promise<Report[]> {
    return this.reportModel
      .find({ isOpen: true })
      .sort({ createdAt: 'desc' })
      .skip(perPage * (page - 1))
      .limit(perPage);
  }

  findOne(
    _id: Types.ObjectId,
    loggedUser: User,
  ): Promise<NullableType<Report>> {
    return this.reportModel.findOne({ _id });
  }

  update(
    _id: Types.ObjectId,
    updateReportDto: UpdateReportDto,
    loggedUser: User,
  ) {
    return `This action updates a #${_id} report`;
  }
}
