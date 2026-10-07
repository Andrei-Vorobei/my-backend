import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '#src/users/users.service.js';
import { User } from '#src/users/entities/user.entity.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(jwtPayload: {
    sub: number | string;
    tokenType?: string;
  }): Promise<User> {
    if (jwtPayload.tokenType && jwtPayload.tokenType !== 'access') {
      throw new UnauthorizedException('Некорректный JWT');
    }

    const userId = Number(jwtPayload.sub);

    if (!Number.isInteger(userId)) {
      throw new UnauthorizedException('Некорректный JWT');
    }

    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return user;
  }
}
