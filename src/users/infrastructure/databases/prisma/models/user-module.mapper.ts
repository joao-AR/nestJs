import { ValidationError } from '@/shared/domain/errors/validation-error';
import { UserEntity, UserRole } from '@/users/domain/entities/user.entity';
import { User } from '@prisma/client';

export class UserModelMapper {
  static toEntity(model: User, roles: UserRole[] = []) {
    const data = {
      name: model.name,
      email: model.email,
      password: model.password,
      createdAt: model.createdAt,
      roles,
    };

    try {
      return new UserEntity(data, model.id);
    } catch {
      throw new ValidationError('Entity cant be loaded');
    }
  }
}
