import {
  AuthService,
  VerifyJwtProps,
} from '@/auth/infrastructure/services/auth.service';
import { Roles } from '@/shared/infrastructure/decorators/Roles.decorator';
import { UserRole } from '@/users/domain/entities/user.entity';
import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest as Request } from 'fastify';
import extractTokenFromHeader from '../utils/extract-token.util';

export interface RequestWithUser
  extends Request<{ Params: { userId?: string } }> {
  user: {
    jwt: VerifyJwtProps;
    roles: UserRole[];
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private AuthService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const jwt = await this.AuthService.verifyJwt(token);
      const roles = jwt.roles || [];
      request.user = { jwt, roles };
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
