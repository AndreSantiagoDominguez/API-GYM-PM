import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { UserController } from './controllers/user.controller';
import { UserMySqlRepository } from './adapters/mysql/user.mysql.repository';
import { GetAllUsersUseCase } from '../application/get-all-users.use-case';
import { GetUserUseCase } from '../application/get-user.use-case';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { DeleteUserUseCase } from '../application/delete-user.use-case';
import { ToggleUserUseCase } from '../application/toggle-user.use-case';
import { USER_REPOSITORY } from '../domain/IUser.repository';
import { RolesModule } from '../../Roles/infrastructure/roles.module';
import { GymsModule } from '../../Gyms/infrastructure/gyms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RolesModule),
    forwardRef(() => GymsModule),
  ],
  controllers: [UserController],
  providers: [
    GetAllUsersUseCase,
    GetUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ToggleUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserMySqlRepository,
    },
  ],
  exports: [USER_REPOSITORY, TypeOrmModule],
})
export class UsersModule {}
