import { UserInMemoryRepository } from '@/shared/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { DeleteUserUseCase } from '../../deleteUser.usecase';

describe('DeleteUserUseCase unit tests', () => {
  let sut: DeleteUserUseCase.UseCase;
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    sut = new DeleteUserUseCase.UseCase(repository);
  });

  it('Should throw a error when entity not found create a user', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('Entity with id fakeId not found'),
    );
  });

  it('Should delete a user', async () => {
    const spyDelete = jest.spyOn(repository, 'delete');
    const items = [new UserEntity(userDataBuilder({}))];
    repository.items = items;
    
    expect(repository.items).toHaveLength(1);
    await sut.execute({ id: items[0]._id });

    expect(spyDelete).toHaveBeenCalledTimes(1);
    expect(repository.items).toHaveLength(0);
  });
});
