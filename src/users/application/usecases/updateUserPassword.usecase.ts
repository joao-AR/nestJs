import { HashProvider } from '@/shared/application/providers/hash-provider';
import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

export type UpdateUserPasswordInput = {
  id: string;
  password: string;
  oldPassword: string;
};

export type UpdateUserPasswordOutput = UserOutputDto;

export class UpdateUserPasswordUseCase
  implements DefaultUseCase<UpdateUserPasswordInput, UpdateUserPasswordOutput>
{
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {}

  async execute(
    input: UpdateUserPasswordInput,
  ): Promise<UpdateUserPasswordOutput> {
    const entity = await this.userRepository.findById(input.id);
    if (!input.password || !input.oldPassword) {
      throw new InvalidPasswordError(
        'Old password and new password is required',
      );
    }

    const checkOldPassword = await this.hashProvider.compareHash(
      input.oldPassword,
      entity.password,
    );

    if (!checkOldPassword) {
      throw new InvalidPasswordError('Old password does not match');
    }

    const hashPassword = await this.hashProvider.generateHash(input.password);
    entity.updatePassword(hashPassword);

    await this.userRepository.update(entity);
    return UserOutPutMapper.toOutput(entity);
  }
}
