import { UpdateUserUseCase } from '@/users/application/usecases/updateUserName.usecase';

export class UpdateUserDto implements Omit<UpdateUserUseCase.Input, 'id'> {
  name: string;
}
