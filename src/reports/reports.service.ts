import { _ } from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report, ReportDocument } from './schemas/report.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { NullableType } from '../common/types/nullable.type';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createDto: CreateReportDto, loggedUser: User): Promise<Report> {
    const user = await this.userModel.findById(createDto.reportedUser);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const report: ReportDocument = new this.reportModel(
      _.assign(createDto, {
        addedBy: loggedUser._id,
      }),
    );
    return report.save();
  }

  async findAll(
    page = 1,
    perPage = 20,
    user: User,
    openedOnly = true,
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

  async update(
    _id: Types.ObjectId,
    updateReportDto: UpdateReportDto,
    loggedUser: User,
  ): Promise<NullableType<Report>> {
    const updated: Report | null = await this.reportModel.findByIdAndUpdate(
      _id,
      updateReportDto,
      {
        returnOriginal: false,
      },
    );
    if (!updated) {
      throw new NotFoundException(`Report not found`);
    }
    return updated;
  }
}
