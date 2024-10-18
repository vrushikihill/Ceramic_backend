import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwtApiSecret'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        enabled: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized!');
    }

    if (!user.enabled) {
      throw new UnauthorizedException('Unauthorized!');
    }

    return user;
  }
}
