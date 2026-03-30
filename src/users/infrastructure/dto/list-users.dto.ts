import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { ListUsersInput } from '@/users/application/usecases/listUsers.usecase';
import { IsOptional, IsString } from 'class-validator';

export class ListUsersDto implements ListUsersInput {
  @IsOptional()
  page?: number;

  @IsOptional()
  perPage?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  sortDir?: SortDirection;

  @IsOptional()
  @IsString()
  filter?: string;
}
