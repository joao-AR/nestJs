import { UserRole } from '@/users/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type GenerateJwtProps = {
  accessToken: string;
};

export type VerifyJwtProps = {
  id: string;
  roles?: UserRole[];
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJwt(
    userId: string,
    roles: UserRole[] = [],
  ): Promise<GenerateJwtProps> {
    const accessToken = await this.jwtService.signAsync({ id: userId, roles });
    return { accessToken };
  }

  async verifyJwt(token: string): Promise<VerifyJwtProps> {
    return await this.jwtService.verifyAsync(token);
  }
}
