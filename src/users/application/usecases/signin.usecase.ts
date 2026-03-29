import { HashProvider } from './../../../shared/application/providers/hash-provider';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';

export type SignInInput = {
  email: string;
  password: string;
};

export type SignInOutput = UserOutputDto;

export class SignInUseCase
  implements DefaultUseCase<SignInInput, SignInOutput>
{
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {}

  async execute(input: SignInInput): Promise<SignInOutput> {
    const { email, password } = input;
    if (!email || !password) {
      throw new BadRequestError('Input data not provided');
    }

    const entity = await this.userRepository.findByEmail(email);

    const hashPasswordMatches = await this.hashProvider.compareHash(
      password,
      entity.password,
    );
    if (!hashPasswordMatches) {
      throw new InvalidCredentialsError('Invalid credentials');
    }
    return UserOutPutMapper.toOutput(entity);
  }
}
