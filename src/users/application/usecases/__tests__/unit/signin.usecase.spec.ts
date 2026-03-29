import { UserInMemoryRepository } from '@/users/infrastructure/databases/in-memory/repositories/user-in-memory.repository';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { SignInUseCase } from '../../signin.usecase';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';

describe('SignInUseCase unit tests', () => {
  let sut: SignInUseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new SignInUseCase(repository, hashProvider);
  });

  it('Should authenticate a user', async () => {
    const spyFindByEmail = jest.spyOn(repository, 'findByEmail');
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'test@test.com', password: hashPassword }),
    );
    repository.items = [entity];

    const result = await sut.execute({
      email: entity.email,
      password: '1234',
    });

    expect(spyFindByEmail).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(entity.toJson());
  });

  it('Should throw error when password not provided', async () => {
    const props = { email: 'test@test.com', password: null };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should not be able to authenticate with wrong email', async () => {
    const props = { email: 'test@test.com', password: '1234' };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('Should not be able to authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'test@test.com', password: hashPassword }),
    );
    repository.items = [entity];

    const props = {
      email: 'test@test.com',
      password: 'fake',
    };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });
});
