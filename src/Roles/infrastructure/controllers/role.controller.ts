import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GetAllRolesUseCase } from '../../application/get-all-roles.use-case';
import { GetRoleUseCase } from '../../application/get-role.use-case';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, RoleNames } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { User } from '../../../Users/domain/user.entity';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(
    private readonly getAllRolesUseCase: GetAllRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
  ) {}

  @Get()
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findAll(@CurrentUser() currentUser: User) {
    const roles = await this.getAllRolesUseCase.execute(currentUser);
    return { success: true, message: 'Roles obtenidos', data: roles };
  }

  @Get(':id')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const role = await this.getRoleUseCase.execute(id);
    return { success: true, message: 'Rol obtenido', data: role };
  }
}
