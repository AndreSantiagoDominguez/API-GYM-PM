import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './Auth/infrastructure/auth.module';
import { UsersModule } from './Users/infrastructure/users.module';
import { RolesModule } from './Roles/infrastructure/roles.module';
import { GymsModule } from './Gyms/infrastructure/gyms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    GymsModule,
  ],
})
export class AppModule {}
