import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash as generateHash } from 'bcrypt';
import * as moment from 'moment';
import { EmailService } from 'src/@core/email/email.service';
import { forgotPasswordTemplate } from 'src/@core/email/templates/forgot-password';
import { verifyEmailTemplate } from 'src/@core/email/templates/verify';
import { APP_NAME } from 'src/constants/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

type LoginArgs = {
  data: LoginDto;
};

type SignTokenArgs = {
  userId: string;
  email: string;
  role: string;
};

type SingUpArgs = {
  data: SignupDto;
};

type ProfileArgs = {
  userId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async login({ data }: LoginArgs) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        password: true,
        id: true,
        email: true,
        enabled: true,
        role: true,
        authProviders: {
          select: {
            provider: true,
          },
        },
        isDeleted: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('invalid credentials');
    }

    if (user.isDeleted) {
      throw new ForbiddenException('Your email is not register with us!');
    }

    if (!user.enabled) {
      throw new UnauthorizedException(
        'To continue, please verify your email address.',
      );
    }

    if (!user.authProviders.some((provider) => provider.provider === 'LOCAL')) {
      throw new ForbiddenException('invalid credentials');
    }

    const isSame = await compare(data.password, user.password);

    if (!isSame) {
      throw new ForbiddenException('invalid credentials');
    }

    return this.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }
  async superAdminLogin({ data }: LoginArgs) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        password: true,
        id: true,
        email: true,
        enabled: true,
        role: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('invalid credentials');
    }

    if (!user.enabled) {
      throw new UnauthorizedException('Unauthorized!');
    }

    const isSame = await compare(data.password, user.password);

    if (!isSame) {
      throw new ForbiddenException('invalid credentials');
    }

    return this.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async signup({ data }: SingUpArgs) {
    const hash: string = await generateHash(data.password, 12);

    const duplicateUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (duplicateUser) {
      if (duplicateUser.isDeleted) {
        throw new ForbiddenException('Your email is not register with us!');
      }

      throw new ForbiddenException('user already exists');
    }

    let organizationData = {};

    if (data.organizationName) {
      organizationData = {
        organizationCreatedBy: {
          create: {
            name: data.organizationName,
            users: {
              connect: {
                email: data.email,
              },
            },
          },
        },
      };
    }

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
        owner: true,
        role: 'ADMIN',
        ...organizationData,
        enabled: false,
        authProviders: {
          create: {
            provider: 'LOCAL',
          },
        },
      },
      select: {
        name: true,
        email: true,
        id: true,
        role: true,
      },
    });

    await this.sendVerificationEmail(user.email, user.id);

    return this.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async profile({ userId }: ProfileArgs) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        id: true,
      },
    });
  }

  async verifyEmailToken(token: string) {
    const tokenDetails = await this.prisma.email_verification_token.findUnique({
      where: {
        token,
        isVerified: false,
      },
      select: {
        id: true,
        user: {
          select: {
            email: true,
            id: true,
          },
        },
        createdAt: true,
        isVerified: true,
      },
    });

    if (!tokenDetails) {
      throw new ForbiddenException('Invalid token');
    }

    if (!moment(tokenDetails.createdAt).isAfter(moment().subtract(1, 'd'))) {
      throw new ForbiddenException('Token already expired!');
    }

    await Promise.all([
      this.prisma.email_verification_token.update({
        where: {
          id: tokenDetails.id,
        },
        data: {
          isVerified: true,
        },
      }),
      this.prisma.user.update({
        where: {
          id: tokenDetails.user.id,
        },
        data: {
          enabled: true,
        },
      }),
    ]);
  }

  async sendResetEmail(email: string) {
    await this.prisma.reset_links.updateMany({
      where: {
        email: email,
      },
      data: {
        isExpired: true,
      },
    });

    const token = await this.prisma.reset_links.create({
      data: {
        email: email,
      },
    });

    await this.emailService.withUser('NOREPLY').sendMail({
      to: email,
      subject: 'Reset Password',
      html: forgotPasswordTemplate(
        this.configService.get<string>('appUrl'),
        token.token,
      ),
    });
  }

  async validateResetPasswordToken(token: string) {
    const tokenDetails = await this.prisma.reset_links.findUnique({
      where: {
        token,
        isExpired: false,
        isUsed: false,
      },
      select: {
        id: true,
        createdAt: true,
        isUsed: true,
        email: true,
      },
    });

    if (!tokenDetails) {
      throw new ForbiddenException('Invalid token');
    }

    if (!moment(tokenDetails.createdAt).isAfter(moment().subtract(1, 'd'))) {
      throw new ForbiddenException('Token already expired!');
    }

    return tokenDetails;
  }

  async setPassword(token: string, password: string, email: string) {
    const hash: string = await generateHash(password, 12);

    const [user] = await Promise.all([
      this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hash,
        },
        select: {
          id: true,
          authProviders: {
            select: {
              provider: true,
            },
          },
        },
      }),
      this.prisma.reset_links.update({
        where: {
          token,
        },
        data: {
          isUsed: true,
        },
      }),
    ]);

    // Add local provider if not exists
    if (user.authProviders.some((provider) => provider.provider !== 'LOCAL')) {
      await this.prisma.oauth_providers.create({
        data: {
          provider: 'LOCAL',
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }
  }

  async signToken({
    userId,
    email,
    role,
  }: SignTokenArgs): Promise<{ authToken: string }> {
    const payload = {
      sub: userId,
      email,
      role,
    };
    const secret = this.configService.get<string>('jwtApiSecret');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15d',
      secret: secret,
    });

    return {
      authToken: token,
    };
  }

  private async sendVerificationEmail(email: string, userId: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.prisma.email_verification_token.create({
          data: {
            isVerified: false,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });

        await this.emailService.withUser('NOREPLY').sendMail({
          to: email,
          subject: `Welcome to ${APP_NAME}`,
          html: verifyEmailTemplate(
            email,
            `${this.configService.get<string>('host')}/api/v1/auth/verify/${
              token.token
            }`,
          ),
        });

        resolve(void 0);
      } catch (error) {
        reject(new InternalServerErrorException('Error sending email'));
      }
    });
  }
}
