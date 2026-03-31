import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { HashingService } from '../helpers/hash-service';
import { AuthDecorator } from '@helpers/auth.decorator';
import { User } from './entities/user.entity';
import { WishesService } from '@wishes/wishes.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly wishesService: WishesService,
  ) {}

  @Get('/me')
  async getMe(@AuthDecorator() user: User & { userId: number }) {
    const { userId: id } = user;
    const currentUser = await this.usersService.findOne({
      where: { id: id },
    });
    return currentUser;
  }

  @Get('/me/wishes')
  async getMyWishes(@AuthDecorator() user: User & { userId: number }) {
    const { userId: id } = user;
    return this.wishesService.findUserWishes(id);
  }

  @Post('find')
  async findMany(@Query('query') query: string) {
    return this.usersService.findUser(query);
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    return this.usersService.findUserByUsername(username);
  }

  @Get(':username/wishes')
  async getWishesByUsername(@Param('username') username: string) {
    const user = await this.usersService.findUserByUsername(username);
    return this.wishesService.findUserWishes(user.id);
  }

  @Patch('/me')
  async updateCurrentUser(
    @AuthDecorator() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUserData = await this.usersService.update(
      user.id,
      updateUserDto,
    );
    return updatedUserData;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
