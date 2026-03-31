import { Module } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from '@offers/entities/offer.entity';
import { User } from '@users/entities/user.entity';
import { Wish } from '@wishes/entities/wish.entity';
import { Wishlist } from '@wishlists/entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, User, Wish, Wishlist])],
  controllers: [WishesController],
  providers: [WishesService],
  exports: [WishesService],
})
export class WishesModule {}
