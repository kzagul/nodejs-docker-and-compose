import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashingService } from '../helpers/hash-service';
import { Offer } from '@offers/entities/offer.entity';
import { User } from './entities/user.entity';
import { Wish } from '@wishes/entities/wish.entity';
import { Wishlist } from '@wishlists/entities/wishlist.entity';
import { WishesModule } from 'src/wishes/wishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wish, Wishlist, Offer, User]),
    WishesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, HashingService],
  exports: [UsersService, HashingService],
})
export class UsersModule {}
