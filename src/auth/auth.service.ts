import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthResponseType } from '../common/types/auth/auth-response.type';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterWithCodeDto } from './dto/register-code.dto';
import {
  Invitation,
  InvitationDocument,
} from '../invitations/schemas/invitation.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private jwtExpires: number;

  constructor(
    private readonly i18nService: I18nService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    @InjectModel(RefreshToken.name) private tokenModel: Model<RefreshToken>,
    @InjectModel(Invitation.name) private invModel: Model<Invitation>,
  ) {
    this.jwtExpires = this.configService.getOrThrow<number>('auth.expires');
  }

  async createAccessToken(user: User): Promise<string> {
    const accessToken: string = this.jwtService.sign({
      sub: user._id,
      _id: user._id,
      roles: user.roles,
    });
    return accessToken;
  }

  async createRefreshToken(user: User): Promise<string> {
    const refreshToken: RefreshTokenDocument = new this.tokenModel({
      userId: user._id,
      refreshToken: `${user._id}.${randomBytes(40).toString('hex')}`,
      email: user.email,
    });
    await refreshToken.save();
    return refreshToken.refreshToken;
  }

  async findRefreshToken(user: User): Promise<string> {
    const refreshToken: RefreshToken | null = await this.tokenModel.findOne({
      userId: user._id,
      email: user.email,
    });
    if (!refreshToken) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: this.i18nService.t('errors.user_logged_out', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }
    return refreshToken.refreshToken;
  }

  async authTokenResponse(user: User) {
    const tokenRes: AuthResponseType = {
      token: {
        tokenType: 'Bearer',
        accessToken: await this.createAccessToken(user),
        refreshToken: await this.findRefreshToken(user),
        expiresIn: new Date(new Date().getTime() + this.jwtExpires * 60000),
      },
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        level: user.level,
        roles: user.roles,
        nReviews: user.nReviews,
        reputation: user.reputation,
        savedArticles: user.savedArticles,
        nBeenVoted: user.nBeenVoted,
        updatedAt: user.updatedAt,
      },
    };
    return tokenRes;
  }

  async login(loginDto: AuthEmailLoginDto): Promise<AuthResponseType> {
    const user: User | null = await this.usersService.findByEmail(
      loginDto.email,
    );

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.i18nService.t('errors.email_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    const isValidPassword: boolean = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: this.i18nService.t('errors.incorrect_password', {
            lang: I18nContext.current()?.lang,
          }),
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.authTokenResponse(user);
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponseType> {
    const user: User = await this.usersService.create(createUserDto);
    await this.createRefreshToken(user);
    return this.authTokenResponse(user);
  }

  async registerWithCode(
    createDto: RegisterWithCodeDto,
  ): Promise<AuthResponseType> {
    const inv: InvitationDocument | null = await this.invModel.findOne({
      invitedEmail: createDto.email,
    });
    if (inv?.code !== createDto.code) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: this.i18nService.t('errors.incorrect_verification_code', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }
    await this.invModel.findOneAndDelete({ invitedEmail: createDto.email });

    const user: User = await this.usersService.create(createDto);
    await this.createRefreshToken(user);
    return this.authTokenResponse(user);
  }

  async refreshAccessToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseType> {
    const refreshToken: RefreshToken | null = await this.tokenModel.findOne({
      email: refreshTokenDto.email,
      refreshToken: refreshTokenDto.refreshToken,
    });
    if (!refreshToken) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: this.i18nService.t('errors.invalid_refresh_token', {
            lang: I18nContext.current()?.lang,
          }),
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const user: User | null = await this.usersService.findOne({
      _id: refreshToken.userId,
    });
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: this.i18nService.t('errors.invalid_refresh_token', {
            lang: I18nContext.current()?.lang,
          }),
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.authTokenResponse(user);
  }
}
