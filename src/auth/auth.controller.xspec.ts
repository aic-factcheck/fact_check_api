import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseType } from '../common/types/auth/auth-response.type';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, PassportModule, JwtModule],
      providers: [
        AuthService,
        UsersService,
        JwtStrategy,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
        ConfigService,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    const result: AuthResponseType = {
      token: {
        tokenType: 'string',
        accessToken: 'string',
        refreshToken: 'string',
        expiresIn: new Date(),
      },
      user: null,
    };
    jest.spyOn(authService, 'register').mockResolvedValue(result);
    jest.spyOn(authService, 'login').mockResolvedValue(result);
    jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(result);

    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
  });
});
