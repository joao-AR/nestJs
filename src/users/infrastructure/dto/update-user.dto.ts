import { UpdateUserNameInput } from '@/users/application/usecases/updateUserName.usecase';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto implements Omit<UpdateUserNameInput, 'id'> {
  @IsString()
  @IsNotEmpty()
  name: string;
}
