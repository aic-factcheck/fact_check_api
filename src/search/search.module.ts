import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
