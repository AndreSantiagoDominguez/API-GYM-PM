import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/user.entity';
import { IUserRepository } from '../../../domain/IUser.repository';

@Injectable()
export class UserMySqlRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['rol', 'gym'],
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['rol', 'gym'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['rol', 'gym'],
    });
  }

  async findByGymId(gym_id: number): Promise<User[]> {
    return this.userRepository.find({
      where: { gym_id },
      relations: ['rol', 'gym'],
      order: { apellidos: 'ASC' },
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);
    return this.findById(savedUser.id);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
