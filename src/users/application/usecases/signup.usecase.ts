import { HashProvider } from './../../../shared/application/providers/hash-provider';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '../../../shared/application/errors/bad-request-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export type SignUpOutput = UserOutputDto;

export class SignUpUseCase
  implements DefaultUseCase<SignUpInput, SignUpOutput>
{
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {}

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    const { email, name, password } = input;
    if (!email || !name || !password) {
      throw new BadRequestError('Input data not provided');
    }
    await this.userRepository.emailExists(email);
    const hashPassword = await this.hashProvider.generateHash(password);
    const entity = new UserEntity(
      Object.assign(input, { password: hashPassword }),
    );
    await this.userRepository.insert(entity);

    return UserOutPutMapper.toOutput(entity);
  }
}
