import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '@wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async findAll(): Promise<Wishlist[]> {
    const wishlists = await this.wishlistRepository.find({
      relations: ['user', 'items'],
    });
    if (wishlists.length === 0) {
      throw new NotFoundException(
        `Еще не было созданно ни одного списка подарков`,
      );
    }
    return wishlists;
  }

  async findById(id: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Вишлист по указанному id ${id} не найден`);
    }
    return wishlist;
  }

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const { itemsId } = createWishlistDto;
    const arrayWishesId = await this.wishRepository.findBy(
      itemsId as FindOptionsWhere<Wish>[],
    );

    const wishlist = await this.wishlistRepository.save({
      ...createWishlistDto,
      user: { id: userId },
      items: arrayWishesId,
    });
    return this.wishlistRepository.save(wishlist);
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });
    const wishes = await this.wishRepository.findByIds(
      updateWishlistDto.itemsId,
    );
    if (!wishlist) {
      throw new NotFoundException(
        `Список подарков по указанному id: ${id} не найден`,
      );
    }
    if (wishlist?.user?.id !== userId) {
      throw new ForbiddenException(
        `Вы не можете редактировать чужой список подарков`,
      );
    }
    return this.wishlistRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      items: wishes,
    });
  }

  async delete(id: number, userId: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!wishlist) {
      throw new NotFoundException(
        `Список подарков по указанному id: ${id} не найден`,
      );
    }
    if (wishlist?.user?.id !== userId) {
      throw new ForbiddenException(
        `Вы не можете удалить чужой список подарков`,
      );
    }
    await this.wishlistRepository.delete(wishlist.id);
    return { message: `Список подарков с id: ${id} успешно удален` };
  }
}
