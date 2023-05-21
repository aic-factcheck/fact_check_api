import { Test, TestingModule } from '@nestjs/testing';
import { HotController } from './hot.controller';
import { HotService } from './hot.service';

describe('HotController', () => {
  let controller: HotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotController],
      providers: [HotService],
    }).compile();

    controller = module.get<HotController>(HotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
