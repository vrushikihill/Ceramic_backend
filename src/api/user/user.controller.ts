import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from 'src/@core/cache/cache.interceptor';
import { CacheInvalidator } from 'src/@core/cache/decorator/cache-invalidator.decorator';
import { Cacheable } from 'src/@core/cache/decorator/cacheable.decorator';
import { Roles } from 'src/constants/roles';
import { AuthService } from '../auth/auth.service';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Role } from '../auth/decorator/role.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { UserService } from './user.service';

const PREFIX = 'USERS';
const SINGLE_PREFIX = 'USERS_SINGLE';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('/me')
  @Role(Roles.USER)
  @UseGuards(JwtGuard, RoleGuard)
  @Cacheable({
    strategy: `${SINGLE_PREFIX}::{USER}`,
  })
  async me(@GetUser('id') userId: string) {
    return await this.userService.findOne({
      id: userId,
    });
  }

  @Get('')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @Cacheable({
    strategy: `{ORGANIZATION}::${PREFIX}::{URL}`,
  })
  async findAll(
    @GetUser('organizationId') organizationId: string,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query(
      'department',
      new ParseArrayPipe({
        optional: true,
      }),
    )
    department?: string[],
    @Query(
      'jobTitle',
      new ParseArrayPipe({
        optional: true,
      }),
    )
    jobTitle?: string[],
  ) {
    const [users, count] = await Promise.all([
      this.userService.find({
        pagination: {
          pageSize: +pageSize || 10,
          page: +page || 0,
        },
        organizationId,
        search: search,
        department: department,
        jobTitle: jobTitle,
      }),
      this.userService.count({
        organizationId,
        search,
        department,
        jobTitle,
      }),
    ]);

    return { data: users, pagination: { count } };
  }

  @Get('/:id')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @Cacheable({
    strategy: `{ORGANIZATION}::${SINGLE_PREFIX}::{OBJECT.PARAMS.id}`,
  })
  async findOne(
    @Param('id') id: string,
    @GetUser('organizationId') organizationId: string,
  ) {
    return await this.userService.findOne({
      id: id,
      organizationId,
    });
  }

  @Post('')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @CacheInvalidator({
    strategies: [`{ORGANIZATION}::${PREFIX}::`],
  })
  async create(
    @Body() data: CreateUserDto,
    @GetUser('id') userId: string,
    @GetUser('name') adminName: string,
  ) {
    return await this.userService.create(
      {
        ...data,
        createdById: userId,
      },
      adminName,
    );
  }

  // @Post('/multiple')
  // @Role(Roles.ADMIN)
  // @UseGuards(JwtGuard, RoleGuard)
  // @CacheInvalidator({
  //   strategies: [`{ORGANIZATION}::${PREFIX}::`],
  // })
  // async createMultiple(
  //   @Body() userData: CreateUserDto[],
  //   @GetUser('id') userId: string,
  //   @GetUser('organizationId') organizationId: string,
  //   @GetUser('name') adminName: string,
  // ) {
  //   return await this.userService.createMany({
  //     data: userData.map((data) => ({
  //       ...data,
  //       createdById: userId,
  //       organizationId: organizationId,
  //     })),
  //     adminName,
  //   });
  // }

  @Put('/:id')
  @Role(Roles.ADMIN)
  @UseGuards(JwtGuard, RoleGuard)
  @CacheInvalidator({
    strategies: [
      `{ORGANIZATION}::${PREFIX}::`,
      `{ORGANIZATION}::${SINGLE_PREFIX}::{OBJECT.PARAMS.id}`,
    ],
  })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @GetUser('id') userId: string,
  ) {
    return await this.userService.update({
      ...data,
      updatedById: userId,
      id: id,
    });
  }

  // @Get('/organizations/:id')
  // @Role(Roles.ADMIN)
  // @UseGuards(JwtGuard, RoleGuard)
  // async findByOrganization(
  //   @Param('id') id: string,
  //   @Query('pageSize') pageSize?: string,
  //   @Query('page') page?: string,
  //   @Query('search') search?: string,
  // ) {
  //   const [users, count] = await Promise.all([
  //     this.userService.findByOrganizationId({
  //       organizationId: id,
  //       pagination: {
  //         pageSize: +pageSize || 10,
  //         page: +page || 0,
  //       },
  //       search: search,
  //     }),
  //     this.userService.count({
  //       organizationId: id,
  //       search,
  //     }),
  //   ]);

  //   return { data: users, pagination: { count } };
  // }

  // @Delete('/:id')
  // @Role(Roles.ADMIN)
  // @UseGuards(JwtGuard, RoleGuard)
  // @CacheInvalidator({
  //   strategies: [
  //     `{ORGANIZATION}::${PREFIX}::`,
  //     `{ORGANIZATION}::${SINGLE_PREFIX}::{OBJECT.PARAMS.id}`,
  //   ],
  // })
  // async delete(@Param('id') id: string, @GetUser('id') userId: string) {
  //   return await this.userService.softDelete(id, userId);
  // }
}
