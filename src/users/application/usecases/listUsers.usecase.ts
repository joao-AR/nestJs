import {
  UserRepository,
  UserSearchParams,
  UserSearchResult,
} from '@/users/domain/repositories/user.repository';
import { SearchInputDto } from '@/shared/application/dto/search-input';
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case';
import {
  PaginationOutputDto,
  paginationOutputMapper,
} from '@/shared/application/dto/pagination-output';
import { UserOutputDto, UserOutPutMapper } from '../dto/user-output';

export type ListUsersInput = SearchInputDto;

export type ListUsersOutput = PaginationOutputDto<UserOutputDto>;

export class ListUsersUseCase
  implements DefaultUseCase<ListUsersInput, ListUsersOutput>
{
  constructor(private userRepository: UserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const params = new UserSearchParams(input);
    const searchResult = await this.userRepository.search(params);

    return this.toOutput(searchResult);
  }

  private toOutput(searchResult: UserSearchResult): ListUsersOutput {
    const items = searchResult.items.map(item =>
      UserOutPutMapper.toOutput(item),
    );

    return paginationOutputMapper.toOutput(items, searchResult);
  }
}
