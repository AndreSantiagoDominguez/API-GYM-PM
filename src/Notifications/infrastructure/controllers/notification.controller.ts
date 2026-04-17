import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, RoleNames } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { User } from '../../../Users/domain/user.entity';
import { BroadcastUseCase } from '../../application/broadcast.use-case';
import { BroadcastDto } from '../../application/dto/broadcast.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly broadcastUseCase: BroadcastUseCase) {}

  @Post('broadcast')
  @Roles(RoleNames.ADMIN, RoleNames.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async broadcast(
    @Body() dto: BroadcastDto,
    @CurrentUser() currentUser: User,
  ) {
    const result = await this.broadcastUseCase.execute(dto, currentUser);
    return {
      success: true,
      message: result.message,
      data: { sent: result.sent },
    };
  }
}
