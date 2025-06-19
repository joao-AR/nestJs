import { SignInUseCase } from '@/users/application/usecases/signin.usecase';

export class SigninDto implements SignInUseCase.Input {
  email: string;
  password: string;
}
