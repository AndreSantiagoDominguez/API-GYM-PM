import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { GetAllUsersUseCase } from '../../application/get-all-users.use-case';
import { GetUserUseCase } from '../../application/get-user.use-case';
import { CreateUserUseCase } from '../../application/create-user.use-case';
import { UpdateUserUseCase } from '../../application/update-user.use-case';
import { DeleteUserUseCase } from '../../application/delete-user.use-case';
import { ToggleUserUseCase } from '../../application/toggle-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, RoleNames } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { User } from '../../domain/user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly toggleUserUseCase: ToggleUserUseCase,
  ) {}

  @Get('/')
  @Roles(RoleNames.SUPER_ADMIN)
  async findAll() {
    const users = await this.getAllUsersUseCase.execute();
    return { success: true, message: 'Usuarios obtenidos', data: users };
  }

  @Get('gym/:gymId')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findByGym(
    @Param('gymId', ParseIntPipe) gymId: number,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.rol.nombre !== 'super_admin' && currentUser.gym_id !== gymId) {
      return { success: false, message: 'No tienes acceso a este gimnasio', data: null };
    }
    const users = await this.getUserUseCase.executeByGym(gymId);
    return { success: true, message: 'Usuarios del gimnasio obtenidos', data: users };
  }

  @Get(':id')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.getUserUseCase.execute(id);
    return { success: true, message: 'Usuario obtenido', data: user };
  }

  @Post("/")
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: User) {
    console.log(dto);
    
    const user = await this.createUserUseCase.execute(dto, currentUser);
    return { success: true, message: 'Usuario creado', data: user };
  }

  @Put('/:id')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO, RoleNames.CLIENTE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.updateUserUseCase.execute(id, dto, currentUser);
    return { success: true, message: 'Usuario actualizado', data: user };
  }

  @Delete('/:id')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    console.log("entro en delete ",id)
    await this.deleteUserUseCase.execute(id, currentUser);
    return { success: true, message: 'Usuario eliminado', data: null };
  }

  @Patch(':id/toggle-active')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN)
  async toggleActive(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    const user = await this.toggleUserUseCase.execute(id, currentUser);
    return { success: true, message: `Usuario ${user.activo ? 'activado' : 'desactivado'}`, data: user };
  }
}
