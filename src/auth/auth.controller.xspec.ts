import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseType } from '../common/types/auth/auth-response.type';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const authRresponse: AuthResponseType = {
    token: {
      tokenType: 'tokenType',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      expiresIn: new Date(),
    },
    user: {},
  };

  const mockAuthService = {
    register: jest.fn().mockReturnValue(authRresponse),
    login: jest.fn().mockReturnValue(authRresponse),
    refreshAccessToken: jest.fn().mockReturnValue(authRresponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    // const result: AuthResponseType = {
    //   token: {
    //     tokenType: 'string',
    //     accessToken: 'string',
    //     refreshToken: 'string',
    //     expiresIn: new Date(),
    //   },
    //   user: null,
    // };
    // jest.spyOn(authService, 'register').mockResolvedValue(result);
    // jest.spyOn(authService, 'login').mockResolvedValue(result);
    // jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(result);

    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });
});
