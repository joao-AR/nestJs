import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts';
import { ListUsersInput } from '@/users/application/usecases/listUsers.usecase';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListUsersDto implements ListUsersInput {
  @ApiPropertyOptional({ description: 'Page to be listed' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  perPage?: number;

  @ApiPropertyOptional({
    description: 'Sort field name or createdAt',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort direction Asc or Desc',
    example: 'asc',
  })
  @IsOptional()
  sortDir?: SortDirection;

  @ApiPropertyOptional({ description: 'Search filter', example: 'John' })
  @IsOptional()
  @IsString()
  filter?: string;
}
