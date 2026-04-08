import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter';
import { UserOutputDto } from '../application/dto/user-output';
import { Transform } from 'class-transformer';
import { ListUsersOutput } from '../application/usecases/listUsers.usecase';
import { ApiProperty } from '@nestjs/swagger';
export class UserPresenter {
  @ApiProperty({ description: 'User id' })
  id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User creation date' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date;

  constructor(output: UserOutputDto) {
    this.id = output.id;
    this.name = output.name;
    this.email = output.email;
    this.createdAt = output.createdAt;
  }
}

export class UserCollectionPresenter extends CollectionPresenter {
  data: UserPresenter[];

  constructor(output: ListUsersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map(item => new UserPresenter(item));
  }
}
