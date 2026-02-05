import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { ValidateUserUseCase } from '../application/validate-user.use-case';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../../Users/infrastructure/users.module';
import { RolesModule } from '../../Roles/infrastructure/roles.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '24h' },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, RegisterUseCase, ValidateUserUseCase, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
