import { SignInInput } from '@/users/application/usecases/signin.usecase';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto implements SignInInput {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
