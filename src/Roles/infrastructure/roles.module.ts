import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../domain/role.entity';
import { RoleController } from './controllers/role.controller';
import { RoleMySqlRepository } from './adapters/mysql/role.mysql.repository';
import { GetAllRolesUseCase } from '../application/get-all-roles.use-case';
import { GetRoleUseCase } from '../application/get-role.use-case';
import { ROLE_REPOSITORY } from '../domain/IRole.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [
    GetAllRolesUseCase,
    GetRoleUseCase,
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleMySqlRepository,
    },
  ],
  exports: [ROLE_REPOSITORY, TypeOrmModule],
})
export class RolesModule {}
