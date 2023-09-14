import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from '../../common/types/auth/jwt-payload.type';
import { OrNeverType } from '../../common/types/or-never.type';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/schemas/user.schema';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private readonly i18nService: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.secret'),
    });
  }

  public async validate(payload: JwtPayloadType): Promise<OrNeverType<User>> {
    if (!payload._id) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: this.i18nService.t('errors.unauthorized', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    const user = await this.usersService.findOne({ _id: payload._id });

    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: this.i18nService.t('errors.unauthorized', {
          lang: I18nContext.current()?.lang,
        }),
      });
    }

    return user;
  }
}
