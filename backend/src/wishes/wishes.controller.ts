import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ConflictException
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { AuthDecorator } from '@helpers/auth.decorator';
import { User } from '@users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('top')
  async findTop() {
    return this.wishesService.findTopWishes();
  }

  @Get('last')
  async findLast() {
    return this.wishesService.findLastWishes();
  }

  @Get()
  async findAll() {
    return this.wishesService.findAll();
  }

  @Post()
  async create(
    @AuthDecorator() user: User,
    @Body() createWishDto: CreateWishDto,
  ) {
    return this.wishesService.create(user.id, createWishDto);
  }

  @Post(':id/copy')
  async copyWish(@Param('id') id: number, @AuthDecorator() user: User) {
    return this.wishesService.copyWish(+id, user.id);
  }

  @Patch(':id')
  async updateWish(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthDecorator() user: User,
  ) {
    return this.wishesService.update(id, updateWishDto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @AuthDecorator() user: User) {
    return this.wishesService.delete(id, user.id);
  }
}
