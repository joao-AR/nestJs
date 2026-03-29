import { UserRepository } from '@/users/domain/repositories/user.repository';
import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';
import { UseCase as defaultUseCase } from '@/shared/application/usecases/use-case';

export type GetUserInput = {
  id: string;
};

export type GetUserOutput = UserOutputDto;

export class GetUserUseCase
  implements defaultUseCase<GetUserInput, GetUserOutput>
{
  constructor(private userRepository: UserRepository) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    const entity = await this.userRepository.findById(input.id);
    return UserOutPutMapper.toOutput(entity);
  }
}
