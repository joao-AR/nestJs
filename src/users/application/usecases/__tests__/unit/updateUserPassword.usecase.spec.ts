import { UserInMemoryRepository } from '@/users/infrastructure/databases/in-memory/repositories/user-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { UpdateUserPasswordUseCase } from '../../updateUserPassword.usecase';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

describe('UpdateUserPasswordUseCase unit tests', () => {
  let sut: UpdateUserPasswordUseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new UpdateUserPasswordUseCase(repository, hashProvider);
  });

  it('Should throw a error when entity not found update a user', async () => {
    await expect(() =>
      sut.execute({
        id: 'fakeId',
        password: 'testPass',
        oldPassword: 'oldPass',
      }),
    ).rejects.toThrow(new NotFoundError('Entity with id fakeId not found'));
  });

  it('Should throw a error when old password not provided', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    repository.items = [entity];

    await expect(() =>
      sut.execute({
        id: entity._id,
        password: 'testPass',
        oldPassword: '',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    );
  });

  it('Should throw a error when new password not provided', async () => {
    const entity = new UserEntity(userDataBuilder({ password: '1234' }));
    repository.items = [entity];

    await expect(() =>
      sut.execute({
        id: entity._id,
        password: '',
        oldPassword: '1234',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    );
  });

  it('Should throw a error when new password and old password do not match', async () => {
    const hashPassword = await hashProvider.generateHash('1234');

    const entity = new UserEntity(userDataBuilder({ password: hashPassword }));
    repository.items = [entity];

    await expect(() =>
      sut.execute({
        id: entity._id,
        password: '4567',
        oldPassword: '8910',
      }),
    ).rejects.toThrow(new InvalidPasswordError('Old password does not match'));
  });

  it('Should update a password of a user', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const spyUpdate = jest.spyOn(repository, 'update');
    const items = [new UserEntity(userDataBuilder({ password: hashPassword }))];
    repository.items = items;

    const result = await sut.execute({
      id: items[0]._id,
      password: '4567',
      oldPassword: '1234',
    });

    const checkNewPassword = await hashProvider.compareHash(
      '4567',
      result.password,
    );

    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(checkNewPassword).toBeTruthy();
  });
});
