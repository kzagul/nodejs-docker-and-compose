import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, FindOneOptions, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { HashingService } from '../helpers/hash-service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async findOne(query: FindOneOptions<User>): Promise<User | null> {
    const user = await this.userRepository.findOne(query);
    if (!user) {
      throw new NotFoundException(
        `Пользователь по указанному запросу: ${query} не найден`,
      );
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({});
  }

  async findUser(query: string) {
    const user = await this.userRepository.find({
      where: [{ username: Like(`${query}`) }, { email: Like(`${query}`) }],
    });
    if (!user) {
      throw new NotFoundException(
        `Пользователь по указанному запросу: ${query} не найден.`,
      );
    }
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async findMany(query: string): Promise<User[]> {
    const user = this.userRepository.find({
      where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
    });
    if (!user) {
      throw new NotFoundException(
        `Пользователь по указанному запросу: ${query} не найден.`,
      );
    }
    return user;
  }

  async findUserByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    if (!user) {
      throw new NotFoundException(
        `Пользователь с именем: ${username} не найден.`,
      );
    }
    return user;
  }

  async update(id: number, updateDto: UpdateUserDto) {
    try {
      const { password } = updateDto;
      const user = await this.findById(id);
      if (password) {
        updateDto.password = await this.hashingService.hashValue(password, 10);
      }
      return await this.userRepository.save({ ...user, ...updateDto });
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Пользователь с таким email или username уже зарегистрирован',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async signup(userDto: CreateUserDto): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: [{ email: userDto.email }, { username: userDto.username }],
    });
    if (existUser) {
      throw new BadRequestException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }
    const { password } = userDto;
    const hashedPassword = await this.hashingService.hashValue(password, 10);
    const user = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }
}
