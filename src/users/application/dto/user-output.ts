import { UserEntity, UserRole } from '@/users/domain/entities/user.entity';

export type UserOutputDto = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  roles?: UserRole[];
};

export class UserOutPutMapper {
  static toOutput(entity: UserEntity): UserOutputDto {
    return entity.toJson();
  }
}
