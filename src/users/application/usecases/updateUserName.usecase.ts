import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

export type UpdateUserNameInput = {
  id: string;
  name: string;
};

export type UpdateUserNameOutput = UserOutputDto;

export class UpdateUserUseCase
  implements DefaultUseCase<UpdateUserNameInput, UpdateUserNameOutput>
{
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserNameInput): Promise<UpdateUserNameOutput> {
    if (!input.name) {
      throw new BadRequestError('Name not provided');
    }

    const entity = await this.userRepository.findById(input.id);
    entity.updateName(input.name);

    await this.userRepository.update(entity);
    return UserOutPutMapper.toOutput(entity);
  }
}
