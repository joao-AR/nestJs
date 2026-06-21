import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RequestWithUser } from './auth.guard';
import extractTokenFromHeader from '../utils/extract-token.util';

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = extractTokenFromHeader(request);
    const user = await this.authService.verifyJwt(token);

    const isAdmin = user?.roles.some(role => role.role === 'admin');
    if (isAdmin) {
      return true;
    }

    if (user.id === request.params?.userId) {
      return true;
    }

    throw new ForbiddenException();
  }
}
