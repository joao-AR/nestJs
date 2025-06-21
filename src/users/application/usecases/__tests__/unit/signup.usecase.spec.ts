import { UserInMemoryRepository } from '@/users/infrastructure/databases/in-memory/repositories/user-in-memory.repository';
import { SignUpUseCase } from '../../signup.usecase';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

describe('SignUpUseCase unit tests', () => {
  let sut: SignUpUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new SignUpUseCase.UseCase(repository, hashProvider);
  });

  it('Should create a user', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const props = userDataBuilder({});
    const result = await sut.execute({
      name: props.name,
      email: props.email,
      password: props.password,
    });

    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(spyInsert).toHaveBeenCalledTimes(1);
  });

  it('Should not be able to register with same email twice', async () => {
    const props = userDataBuilder({ email: 'test@test.com' });
    await sut.execute(props);
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it('Should throw error when name not provided', async () => {
    const props = Object.assign(userDataBuilder({}), { name: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should throw error when email not provided', async () => {
    const props = Object.assign(userDataBuilder({}), { email: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should throw error when password not provided', async () => {
    const props = Object.assign(userDataBuilder({}), { password: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
