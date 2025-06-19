import { UpdateUserPasswordUseCase } from '@/users/application/usecases/updateUserPassword.usecase';

export class UpdatePasswordDto
  implements Omit<UpdateUserPasswordUseCase.Input, 'id'>
{
  password: string;
  oldPassword: string;
}
