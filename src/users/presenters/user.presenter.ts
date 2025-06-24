import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter';
import { UserOutputDto } from '../application/dto/user-output';
import { Transform } from 'class-transformer';
import { ListUsersUseCase } from '../application/usecases/listUsers.usecase';
export class UserPresenter {
  id: string;
  name: string;
  email: string;

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

  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map(item => new UserPresenter(item));
  }
}
