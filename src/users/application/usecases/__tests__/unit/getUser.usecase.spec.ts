import { UserInMemoryRepository } from '@/users/infrastructure/databases/in-memory/repositories/user-in-memory.repository';
import { GetUserUseCase } from '../../getUser.usecase';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('getUserUsecase unit tests', () => {
  let sut: GetUserUseCase;
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    sut = new GetUserUseCase(repository);
  });

  it('Should throw a error when entity not found create a user', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('Entity with id fakeId not found'),
    );
  });

  it('Should be able to get user', async () => {
    const spyFindById = jest.spyOn(repository, 'findById');
    const items = [new UserEntity(userDataBuilder({}))];
    repository.items = items;
    const result = await sut.execute({ id: items[0]._id });
    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: items[0]._id,
      name: items[0].name,
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    });
  });
});
