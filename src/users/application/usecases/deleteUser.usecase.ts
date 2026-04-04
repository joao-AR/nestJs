import { UserRepository } from '@/users/domain/repositories/user.repository';
import { UseCase as defaultUseCase } from '@/shared/application/usecases/use-case';

export type DeleteUserInput = {
  id: string;
};

export type DeleteUserOutput = void;

export class DeleteUserUseCase
  implements defaultUseCase<DeleteUserInput, DeleteUserOutput>
{
  constructor(private userRepository: UserRepository) {}

  async execute(input: DeleteUserInput): Promise<DeleteUserOutput> {
    await this.userRepository.delete(input.id);
  }
}
