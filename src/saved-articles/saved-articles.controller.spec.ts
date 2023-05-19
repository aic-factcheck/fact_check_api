import { Test, TestingModule } from '@nestjs/testing';
import { SavedArticlesController } from './saved-articles.controller';

describe('SavedArticlesController', () => {
  let controller: SavedArticlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedArticlesController],
    }).compile();

    controller = module.get<SavedArticlesController>(SavedArticlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
