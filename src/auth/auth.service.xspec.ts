import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let refreshModel: Model<RefreshToken>;

  const user: User = {
    _id: new Types.ObjectId('646b69f8d72e72bf8adb8586'),
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@gmail.com',
    level: 6,
    roles: ['user', 'admin'],
    nReviews: 4,
    reputation: 798,
    savedArticles: [],
    nBeenVoted: 0,
    password: 'pwd',
    picture: 'any',
    updatedAt: new Date(),
    createdAt: new Date(),
    verified: false,
    loginAttempts: 3,
    invitedBy: '',
  };

  const rt1 = {
    _id: new Types.ObjectId('646b69f8d72e72bf8adb8586'),
    userId: new Types.ObjectId('646b69f8d72e72bf8adb8586'),
    email: 'est@email.co',
    refreshToken: 'refreshToken',
    expires: new Date(),
    createdAt: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedToken'),
  };

  const mockUsersService = {
    findByEmail: jest.fn().mockReturnValue(user),
    create: jest.fn().mockReturnValue(user),
    findOne: jest.fn().mockReturnValue(user),
  };

  const mockConfigService = {
    getOrThrow: jest.fn().mockImplementation((path: string) => {
      switch (path) {
        case 'auth.expires':
          return 15;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: Model,
        },
      ],
      imports: [],
    }).compile();

    service = module.get<AuthService>(AuthService);
    refreshModel = module.get<Model<RefreshToken>>(
      getModelToken(RefreshToken.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccessToken  function', () => {
    it('should create JWT access token with user encoded', async () => {
      const jwt = await service.createAccessToken(user);
      expect(jwt).toEqual('mockedToken');
    });
  });

  describe('findRefreshToken function', () => {
    it('should throw error for not found refresh token', async () => {
      jest.spyOn(refreshModel, 'findOne').mockResolvedValue(null);

      await expect(service.findRefreshToken(user)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not throw error for existing refresh token', async () => {
      jest.spyOn(refreshModel, 'findOne').mockResolvedValue(rt1);

      await expect(service.findRefreshToken(user)).resolves.not.toThrow(
        UnauthorizedException,
      );
    });

    it('should return refresh token', async () => {
      jest.spyOn(refreshModel, 'findOne').mockResolvedValue(rt1);

      const rt = await service.findRefreshToken(user);
      expect(typeof rt).toBe('string');
      expect(rt).toEqual(rt1.refreshToken);
    });
  });

  describe('Login function', () => {
    it('Should login user', async () => {
      jest.spyOn(refreshModel, 'findOne').mockResolvedValue(rt1);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((pwd, actual) => pwd === actual);

      const authRes = await service.login({
        email: 'test@email.com',
        password: user.password,
      });
      expect(authRes).toBeInstanceOf(Object);
      expect(authRes).toHaveProperty('token');
      expect(authRes.token.refreshToken).toEqual(rt1.refreshToken);

      expect(authRes).toHaveProperty('user');
      expect(authRes.user._id).toEqual(user._id);
    });
  });

  it('Should throw error for incorrect password', async () => {
    jest.spyOn(refreshModel, 'findOne').mockResolvedValue(rt1);
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation((pwd, actual) => pwd === actual);

    await expect(
      service.login({
        email: 'test@email.com',
        password: 'notCorrectPwd',
      }),
    ).rejects.toThrow(HttpException);
  });
});
