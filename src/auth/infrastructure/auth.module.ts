import { SignOptions } from './../../../node_modules/@types/jsonwebtoken/index.d';

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';

@Module({
  imports: [
    EnvConfigModule,
    JwtModule.registerAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: async (configService: EnvConfigService) => ({
        global: true,
        secret: configService.getJwtSecret(),
        SignOptions: configService.getJwtExpiresInSeconds(),
      }),
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
