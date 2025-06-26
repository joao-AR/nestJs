import { UpdateUserPasswordUseCase } from '@/users/application/usecases/updateUserPassword.usecase';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto
  implements Omit<UpdateUserPasswordUseCase.Input, 'id'>
{
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
