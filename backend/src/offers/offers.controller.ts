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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { AuthDecorator } from '@helpers/auth.decorator';
import { User } from '@users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.offersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @AuthDecorator() user: User,
  ) {
    return this.offersService.create(createOfferDto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.update(+id, updateOfferDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.offersService.remove(+id);
  }
}
