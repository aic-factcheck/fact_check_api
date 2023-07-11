import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatusEnum } from '../enums/status.enum';

export class UpdateReportDto {
  @ApiProperty({ example: 'SUBMITTED' })
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ReportStatusEnum)
  status: ReportStatusEnum;
}
