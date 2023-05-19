import { Test, TestingModule } from '@nestjs/testing';
import { SavedArticlesService } from './saved-articles.service';

describe('SavedArticlesService', () => {
  let service: SavedArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedArticlesService],
    }).compile();

    service = module.get<SavedArticlesService>(SavedArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
