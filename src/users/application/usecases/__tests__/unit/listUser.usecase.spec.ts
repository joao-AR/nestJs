import { UserInMemoryRepository } from '@/users/infrastructure/databases/in-memory/repositories/user-in-memory.repository';
import { ListUsersUseCase } from '../../listUsers.usecase';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('ListUser usecase unit tests', () => {
  let sut: ListUsersUseCase.UseCase;
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    sut = new ListUsersUseCase.UseCase(repository);
  });

  it('toOutPut Method', () => {
    let result = new UserRepository.SearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      sort: null,
      sortDir: null,
      filter: null,
    });

    let output = sut['toOutput'](result);

    expect(output).toStrictEqual({
      items: [],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      perPage: 2,
    });

    let entity = new UserEntity(userDataBuilder({}));

    result = new UserRepository.SearchResult({
      items: [entity],
      total: 1,
      currentPage: 1,
      perPage: 2,
      sort: null,
      sortDir: null,
      filter: null,
    });

    output = sut['toOutput'](result);

    expect(output).toStrictEqual({
      items: [entity.toJson()],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      perPage: 2,
    });
  });

  it('should return the users ordered by createdAt', async () => {
    const createdAt = new Date();
    const items = [
      new UserEntity(userDataBuilder({ createdAt: createdAt })),
      new UserEntity(
        userDataBuilder({ createdAt: new Date(createdAt.getTime() + 1) }),
      ),
    ];

    repository.items = items;

    const output = await sut.execute({});

    expect(output).toStrictEqual({
      items: [...items].reverse().map(item => item.toJson()),
      total: 2,
      currentPage: 1,
      lastPage: 1,
      perPage: 15,
    });

    let entity = new UserEntity(userDataBuilder({}));
  });

  it('should return the users using pagination and, sort and filter', async () => {
    const items = [
      new UserEntity(userDataBuilder({ name: 'a' })),
      new UserEntity(userDataBuilder({ name: 'AA' })),
      new UserEntity(userDataBuilder({ name: 'Aa' })),
      new UserEntity(userDataBuilder({ name: 'b' })),
      new UserEntity(userDataBuilder({ name: 'c' })),
    ];

    repository.items = items;

    let output = await sut.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    });

    expect(output).toStrictEqual({
      items: [items[1].toJson(), items[2].toJson()],
      total: 3,
      currentPage: 1,
      lastPage: 2,
      perPage: 2,
    });

    output = await sut.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    });

    expect(output).toStrictEqual({
      items: [items[0].toJson()],
      total: 3,
      currentPage: 2,
      lastPage: 2,
      perPage: 2,
    });

    output = await sut.execute({
      page: 1,
      perPage: 3,
      sort: 'name',
      sortDir: 'desc',
      filter: 'a',
    });

    expect(output).toStrictEqual({
      items: [items[0].toJson(), items[2].toJson(), items[1].toJson()],
      total: 3,
      currentPage: 1,
      lastPage: 1,
      perPage: 3,
    });
  });
});
