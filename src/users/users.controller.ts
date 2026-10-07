import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service.js';
import { JwtGuard } from '#src/auth/jwt.guard.js';

type AuthenticatedRequest = Request & {
  user: {
    id: number;
    username: string;
  };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get(':username')
  async findUser(@Param('username') username: string) {
    const user = await this.usersService.findUserByFilter({ username });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, yandexId, email, ...publicUser } = user;

    return publicUser;
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async findMe(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findUserById(req.user.id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, yandexId, ...profile } = user;

    return profile;
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    if (id !== req.user.id) {
      throw new ForbiddenException('Можно удалить только свой аккаунт');
    }

    const result = await this.usersService.removeUser(id);

    if (result.affected === 0) {
      throw new NotFoundException('Пользователь не найден');
    }
  }
}
