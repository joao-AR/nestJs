import { SignUpInput } from '@/users/application/usecases/signup.usecase';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto implements SignUpInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
