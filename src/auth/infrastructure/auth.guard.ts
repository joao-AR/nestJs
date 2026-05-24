import {
  AuthService,
  VerifyJwtProps,
} from '@/auth/infrastructure/auth.service';
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

export interface RequestWithUser extends Request {
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
    const token = this.extractTokenFromHeader(request);
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
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

    if (requiredRoles && requiredRoles.length > 0) {
      const userHasRole = this.matchRoles(requiredRoles, request.user.roles);
      if (!userHasRole) {
        throw new UnauthorizedException();
      }
    }

    return true;
  }

  private matchRoles(requiredRoles: string[], userRoles: UserRole[]): boolean {
    const userRolesLower = new Set(userRoles.map(ur => ur.role.toLowerCase()));

    return requiredRoles.every(requiredRole =>
      userRolesLower.has(requiredRole.toLowerCase()),
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
