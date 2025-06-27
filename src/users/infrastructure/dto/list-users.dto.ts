import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { ListUsersUseCase } from '@/users/application/usecases/listUsers.usecase';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ListUsersDto implements ListUsersUseCase.Input {
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
