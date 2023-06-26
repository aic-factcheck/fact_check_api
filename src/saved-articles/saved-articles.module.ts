import { Module } from '@nestjs/common';
import { SavedArticlesController } from './saved-articles.controller';
import { SavedArticlesService } from './saved-articles.service';
import { SharedModelsModule } from '../shared/shared-models/shared-models.module';

@Module({
  imports: [SharedModelsModule],
  controllers: [SavedArticlesController],
  providers: [SavedArticlesService],
  exports: [],
})
export class SavedArticlesModule {}
