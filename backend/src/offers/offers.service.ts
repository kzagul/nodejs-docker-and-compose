import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Wish } from '@wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async findAll(): Promise<Offer[]> {
    const offers = await this.offerRepository.find({
      relations: ['user'],
    });
    if (offers.length === 0) {
      throw new NotFoundException(`Еще нет желающих скинуться`);
    }
    return offers;
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!offer) {
      throw new NotFoundException(`Подарок по указанному id: ${id} не найден`);
    }
    return offer;
  }

  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const { amount, wishId } = createOfferDto;
    const wish = await this.wishRepository.findOne({
      where: { id: wishId },
      relations: ['user', 'offers'],
    });

    if (userId === wish.user.id) {
      throw new ForbiddenException(`Вы не можете скидываться на свой подарок`);
    }

    const offer = await this.offerRepository.create({
      ...createOfferDto,
      item: wish,
      user: { id: userId },
    });

    if (offer.amount + wish.raised > wish.price) {
      throw new ForbiddenException(
        `Сумма, которую вы пытаетесь скинуть превышает стоимость подарка`,
      );
    }

    wish.raised += amount;
    await this.wishRepository.save(wish);
    return this.offerRepository.save(offer);
  }

  async update(id: number, updateData: Partial<Offer>): Promise<Offer> {
    await this.offerRepository.update(id, updateData);
    return this.offerRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.offerRepository.delete(id);
  }
}
