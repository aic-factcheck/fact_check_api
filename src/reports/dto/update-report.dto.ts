import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateReportDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isOpen: boolean;
}
