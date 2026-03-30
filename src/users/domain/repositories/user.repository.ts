import { UserEntity } from './../entities/user.entity';
import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRepositoryInterface,
} from '@/shared/domain/repositories/searchable-repository-contracts';

export type UserFilter = string;

export class UserSearchParams extends DefaultSearchParams<UserFilter> {}

export class UserSearchResult extends DefaultSearchResult<
  UserEntity,
  UserFilter
> {}

export interface UserRepository
  extends SearchableRepositoryInterface<
    UserEntity,
    UserFilter,
    UserSearchParams,
    UserSearchResult
  > {
  findByEmail(email: string): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity>;
  findAll(): Promise<UserEntity[]>;
  emailExists(email: string): Promise<void>;
  delete(id: string): Promise<void>;
}
