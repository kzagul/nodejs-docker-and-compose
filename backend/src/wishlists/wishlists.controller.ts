import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { AuthDecorator } from '@helpers/auth.decorator';
import { User } from '@users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async findAll() {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.wishlistsService.findById(+id);
  }

  @Post()
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @AuthDecorator() user: User,
  ) {
    return this.wishlistsService.create(createWishlistDto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @AuthDecorator() user: User,
  ) {
    return this.wishlistsService.update(id, updateWishlistDto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @AuthDecorator() user: User) {
    return this.wishlistsService.delete(+id, user.id);
  }
}
