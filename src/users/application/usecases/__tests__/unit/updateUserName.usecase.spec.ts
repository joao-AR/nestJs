import { UserInMemoryRepository } from '@/users/infrastructure/databases/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdateUserUseCase } from '../../updateUserName.usecase';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

describe('UpdateUserUseCase unit tests', () => {
  let sut: UpdateUserUseCase.UseCase;
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    sut = new UpdateUserUseCase.UseCase(repository);
  });

  it('Should throw a error when entity not found update a user', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'test' }),
    ).rejects.toThrow(new NotFoundError('Entity with id fakeId not found'));
  });

  it('Should throw a error when name not provided', async () => {
    await expect(() => sut.execute({ id: 'fakeId', name: '' })).rejects.toThrow(
      new BadRequestError('Name not provided'),
    );
  });

  it('Should update a user', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const items = [new UserEntity(userDataBuilder({}))];
    repository.items = items;
    const result = await sut.execute({ id: items[0]._id, name: 'new name' });

    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      id: items[0]._id,
      name: 'new name',
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    });
  });
});
