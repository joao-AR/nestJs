import { UserRepository } from '@/users/domain/repositories/user.repository';
import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';
import { UseCase as defaultUseCase } from '@/shared/application/usecases/use-case';

export namespace GetUserUseCase {
  export type Input = {
    id: string;
  };

  export type Output = UserOutputDto;

  export class UseCase implements defaultUseCase<Input, Output> {
    constructor(private userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.userRepository.findById(input.id);
      return UserOutPutMapper.toOutput(entity);
    }
  }
}
