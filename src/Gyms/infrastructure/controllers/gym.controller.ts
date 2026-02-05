import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { GetAllGymsUseCase } from '../../application/get-all-gyms.use-case';
import { GetGymUseCase } from '../../application/get-gym.use-case';
import { CreateGymUseCase } from '../../application/create-gym.use-case';
import { UpdateGymUseCase } from '../../application/update-gym.use-case';
import { DeleteGymUseCase } from '../../application/delete-gym.use-case';
import { ToggleGymUseCase } from '../../application/toggle-gym.use-case';
import { CreateGymDto } from '../../application/dto/create-gym.dto';
import { UpdateGymDto } from '../../application/dto/update-gym.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, RoleNames } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { User } from '../../../Users/domain/user.entity';

@Controller('gyms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GymController {
  constructor(
    private readonly getAllGymsUseCase: GetAllGymsUseCase,
    private readonly getGymUseCase: GetGymUseCase,
    private readonly createGymUseCase: CreateGymUseCase,
    private readonly updateGymUseCase: UpdateGymUseCase,
    private readonly deleteGymUseCase: DeleteGymUseCase,
    private readonly toggleGymUseCase: ToggleGymUseCase,
  ) {}

  @Get()
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findAll(@CurrentUser() currentUser: User) {
    const gyms = currentUser.rol.nombre === 'super_admin'
      ? await this.getAllGymsUseCase.execute()
      : await this.getAllGymsUseCase.executeActive();
    return { success: true, message: 'Gimnasios obtenidos', data: gyms };
  }

  @Get('active')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findActive() {
    const gyms = await this.getAllGymsUseCase.executeActive();
    return { success: true, message: 'Gimnasios activos obtenidos', data: gyms };
  }

  @Get(':id')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN, RoleNames.EMPLEADO)
  async findById(@Param('id', ParseIntPipe) id: number) {
    const gym = await this.getGymUseCase.execute(id);
    return { success: true, message: 'Gimnasio obtenido', data: gym };
  }

  @Post()
  @Roles(RoleNames.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGymDto, @CurrentUser() currentUser: User) {
    const gym = await this.createGymUseCase.execute(dto, currentUser);
    return { success: true, message: 'Gimnasio creado', data: gym };
  }

  @Put(':id')
  @Roles(RoleNames.SUPER_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGymDto,
    @CurrentUser() currentUser: User,
  ) {
    const gym = await this.updateGymUseCase.execute(id, dto, currentUser);
    return { success: true, message: 'Gimnasio actualizado', data: gym };
  }

  @Delete(':id')
  @Roles(RoleNames.SUPER_ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    await this.deleteGymUseCase.execute(id, currentUser);
    return { success: true, message: 'Gimnasio eliminado', data: null };
  }

  @Patch(':id/toggle-active')
  @Roles(RoleNames.SUPER_ADMIN)
  async toggleActive(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: User) {
    const gym = await this.toggleGymUseCase.execute(id, currentUser);
    return { success: true, message: `Gimnasio ${gym.activo ? 'activado' : 'desactivado'}`, data: gym };
  }
}
