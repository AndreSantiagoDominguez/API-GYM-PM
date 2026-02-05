import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gym } from '../domain/gym.entity';
import { GymController } from './controllers/gym.controller';
import { GymMySqlRepository } from './adapters/mysql/gym.mysql.repository';
import { GetAllGymsUseCase } from '../application/get-all-gyms.use-case';
import { GetGymUseCase } from '../application/get-gym.use-case';
import { CreateGymUseCase } from '../application/create-gym.use-case';
import { UpdateGymUseCase } from '../application/update-gym.use-case';
import { DeleteGymUseCase } from '../application/delete-gym.use-case';
import { ToggleGymUseCase } from '../application/toggle-gym.use-case';
import { GYM_REPOSITORY } from '../domain/IGym.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Gym])],
  controllers: [GymController],
  providers: [
    GetAllGymsUseCase,
    GetGymUseCase,
    CreateGymUseCase,
    UpdateGymUseCase,
    DeleteGymUseCase,
    ToggleGymUseCase,
    {
      provide: GYM_REPOSITORY,
      useClass: GymMySqlRepository,
    },
  ],
  exports: [GYM_REPOSITORY, TypeOrmModule],
})
export class GymsModule {}
