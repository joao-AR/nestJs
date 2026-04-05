import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type GenerateJwtProps = {
  accessToken: string;
};

export type VerifyJwtProps = {
  id: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJwt(userId: string): Promise<GenerateJwtProps> {
    const accessToken = await this.jwtService.signAsync({ id: userId });
    return { accessToken };
  }

  async verifyJwt(token: string): Promise<VerifyJwtProps> {
    return await this.jwtService.verifyAsync(token);
  }
}
