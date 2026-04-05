import {
  AuthService,
  VerifyJwtProps,
} from '@/auth/infrastructure/auth.service';
import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';

import { FastifyRequest as Request } from 'fastify';

export interface RequestWithUser extends Request {
  user: VerifyJwtProps;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private AuthService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.AuthService.verifyJwt(token);
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
