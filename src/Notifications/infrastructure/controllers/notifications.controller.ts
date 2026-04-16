import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BroadcastAnnouncementUseCase } from '../../application/broadcast-announcement.use-case';
import { BroadcastDto } from '../../application/dto/broadcast.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, RoleNames } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { User } from '../../../Users/domain/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly broadcastUseCase: BroadcastAnnouncementUseCase,
  ) {}

  @Post('broadcast')
  @Roles(RoleNames.SUPER_ADMIN, RoleNames.ADMIN)
  @HttpCode(HttpStatus.OK)
  async broadcast(
    @Body() dto: BroadcastDto,
    @CurrentUser() currentUser: User,
  ) {
    const adminName =
      [currentUser?.nombres, currentUser?.apellidos]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Admin';

    const data = await this.broadcastUseCase.execute(dto, adminName);

    return {
      success: true,
      message: 'Broadcast enviado',
      data,
    };
  }
}
