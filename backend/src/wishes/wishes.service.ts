import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async findAll(): Promise<Wish[]> {
    const wishes = await this.wishRepository.find({ relations: ['offers'] });
    if (wishes.length === 0) {
      throw new NotFoundException(`Еще не было созданно ни одного подарка`);
    }
    return wishes;
  }

  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['offers', 'owner'],
    });
    if (!wish) {
      throw new NotFoundException(`Подарок по указанному id ${id} не найден`);
    } else {
      return wish;
    }
  }

  async findLastWishes() {
    const lastWishes = await this.wishRepository.find({
      take: 40,
      order: {
        createdAt: 'DESC',
      },
      relations: ['owner'],
    });
    return lastWishes;
  }

  async findTopWishes() {
    const topWishes = await this.wishRepository.find({
      take: 10,
      order: {
        copied: 'DESC',
      },
      relations: ['owner'],
    });
    return topWishes;
  }

  async findUserWishes(ownerId: number) {
    return this.wishRepository.find({
      where: { owner: { id: ownerId } },
    });
  }

  async create(userId: number, createWishDto: CreateWishDto): Promise<Wish> {
    const newWish = await this.wishRepository.create({
      ...createWishDto,
      owner: { id: userId },
    });
    return this.wishRepository.save(newWish);
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wish) {
      throw new NotFoundException(`Подарок по указанному id ${id} не найден`);
    }
    if (wish?.owner?.id !== userId) {
      throw new ForbiddenException(`Вы не можете редактировать чужой подарок`);
    }
    if (wish.raised > 0) {
      throw new ForbiddenException(
        `На подарок уже скинулись,поэтому его нельзя редактировать`,
      );
    }
    return this.wishRepository.save({ ...wish, ...updateWishDto });
  }

  async delete(id: number, userId: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wish) {
      throw new NotFoundException(`Подарок по указанному id ${id} не найден`);
    }
    if (wish?.owner?.id !== userId) {
      throw new ForbiddenException(`Вы не можете удалить чужой подарок`);
    }
    await this.wishRepository.delete(wish.id);
    return { message: `Подарок с ${id} успешно удален` };
  }

  async copyWish(id: number, userId: number) {
    const wishToCopy = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    const existWishToCopy = await this.wishRepository.findOneBy({
      name: wishToCopy.name,
      owner: { id: userId },
    });
    if (existWishToCopy) {
      throw new ConflictException(`Вы уже копировали к себе этот подарок`);
    }
    if (!wishToCopy) {
      throw new NotFoundException(`Подарок по указанному id ${id} не найден`);
    }
    if (wishToCopy?.owner?.id === userId) {
      throw new UnauthorizedException(
        'Вы не можете копировать свой собственный подарок.',
      );
    }
    wishToCopy.copied += 1;
    await this.wishRepository.save({ ...wishToCopy });
    const copiedWish = await this.wishRepository.create({
      ...wishToCopy,
      owner: { id: userId },
    });
    return this.wishRepository.save(copiedWish);
  }
}
