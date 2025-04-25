import { UserRepository } from '@/users/domain/repositories/user.repository';;
import { UseCase as defaultUseCase } from '@/shared/application/usecases/use-case';

export namespace DeleteUserUseCase {
  export type Input = {
    id: string;
  };

  export type Output = void;

  export class UseCase implements defaultUseCase<Input, Output> {
    constructor(private userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.userRepository.delete(input.id);
    }
  }
}
