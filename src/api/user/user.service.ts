import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { oauth_providers_enum, user_role } from '@prisma/client';
import { EmailService } from 'src/@core/email/email.service';
import { setPasswordTemplate } from 'src/@core/email/templates/set-passwors';
import { APP_NAME } from 'src/constants/constants';
import { PaginationDto } from 'src/constants/dto/pagination.dto';
import {
  OAuthProvidersEnum,
  getKeyByValueOAuthProviders,
} from 'src/constants/types';
import { PrismaService } from 'src/prisma/prisma.service';

type FindArgs = {
  pagination: PaginationDto;
  organizationId: string;
  search?: string;
  department?: string[];
  jobTitle?: string[];
};

type FindOneArgs = {
  id: string;
  organizationId?: string;
};

type CreateArgs = {
  name: string;
  email: string;
  enabled: boolean;
  createdById: string;
  role: user_role;
};

// type CreateManyArgs = {
//   data: CreateArgs[];
//   adminName: string;
// };

type UpdateArgs = {
  id: string;
  name?: string;
  email?: string;
  enabled?: boolean;
  updatedById: string;
  role: user_role;
};

type CountArgs = {
  organizationId: string;
  search?: string;
  department?: string[];
  jobTitle?: string[];
};

type FindOrCreateArgs = {
  email: string;
  name: string;
  provider: OAuthProvidersEnum;
  role: user_role;
};

const defaultSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: false,
  owner: true,
  createdBy: {
    select: {
      name: true,
      id: true,
    },
  },
  updatedBy: {
    select: {
      name: true,
      id: true,
    },
  },

  role: true,
  enabled: true,
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  async find({ pagination, search }: FindArgs) {
    return await this.prisma.user.findMany({
      skip: pagination.page * pagination.pageSize,
      take: pagination.pageSize,
      select: defaultSelect,
      where: {
        // organizationId,
        name: {
          contains: search,
        },
        isDeleted: false,
      },
    });
  }

  async findOne({ id }: FindOneArgs) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        ...defaultSelect,
      },
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async create(data: CreateArgs, adminName: string) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        isDeleted: true,
      },
    });

    let user: any;

    if (userExists) {
      if (userExists.isDeleted) {
        user = await this.prisma.user.update({
          where: {
            id: userExists.id,
          },
          data: {
            isDeleted: false,
          },
          select: defaultSelect,
        });
      }

      throw new NotAcceptableException('user already exists');
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role,
          enabled: data.enabled,

          authProviders: {
            create: {
              provider: 'LOCAL',
            },
          },
          createdBy: {
            connect: {
              id: data.createdById,
            },
          },
        },
        select: defaultSelect,
      });
    }

    this.sendInvitationEmail(user.email, adminName);

    return user;
  }

  // async createMany({ data, adminName }: CreateManyArgs) {
  //   const res = await this.prisma.user.createMany({
  //     data: data,
  //     skipDuplicates: true,
  //   });

  //   const users = await this.prisma.user.findMany({
  //     where: {
  //       email: {
  //         in: data.map((user) => user.email),
  //       },
  //     },
  //     select: {
  //       email: true,
  //       id: true,
  //       enabled: true,
  //       isDeleted: true,
  //     },
  //   });

  //   users.forEach((user) => {
  //     if (!user.isDeleted && user.enabled) {
  //       this.sendInvitationEmail(user.email, adminName);
  //     }
  //   });

  //   return res;
  // }

  async update(data: UpdateArgs) {
    if (data.updatedById === data.id && data.email) {
      throw new NotAcceptableException('you cannot change your email');
    }

    return await this.prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data.email,
        name: data.name,
        enabled: data.enabled,
        role: data.role,
        updatedBy: {
          connect: {
            id: data.updatedById,
          },
        },
      },
      select: defaultSelect,
    });
  }

  private async sendInvitationEmail(email: string, adminName: string) {
    const tokenDetails = await this.prisma.reset_links.create({
      data: {
        email,
      },
    });
    console.log(
      'tokenDetails----------------->',
      process.env.APP_URL + '/set-password?token=' + tokenDetails.token,
    );

    // await this.emailService.withUser('NOREPLY').sendMail({
    //   to: email,
    //   subject: `${APP_NAME} Invitation`,
    //   html: setPasswordTemplate(
    //     process.env.APP_URL,
    //     tokenDetails.token,
    //     adminName,
    //   ),
    // });
  }

  async count({ search }: CountArgs) {
    return await this.prisma.user.count({
      where: {
        name: {
          contains: search,
        },
        isDeleted: false,
      },
    });
  }

  async findOrCreate({ email, name, role, provider }: FindOrCreateArgs) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        role: true,
        id: true,
        authProviders: {
          select: {
            provider: true,
          },
        },
        isDeleted: true,
      },
    });

    const _provider = getKeyByValueOAuthProviders(provider);

    if (user) {
      if (user.isDeleted) {
        throw new ForbiddenException('Your email is not register with us!');
      }

      const providerExists = user.authProviders.some(
        (authProvider) => authProvider.provider === _provider,
      );

      if (!providerExists) {
        await this.prisma.oauth_providers.create({
          data: {
            provider: oauth_providers_enum[_provider],
            userId: user.id,
          },
        });
      }

      return user;
    }

    return await this.prisma.user.create({
      data: {
        email,
        name,
        role: role,
        enabled: true,
        owner: true,
        authProviders: {
          create: {
            provider: oauth_providers_enum[_provider],
          },
        },
      },
      select: {
        email: true,
        role: true,
        id: true,
      },
    });
  }
}
