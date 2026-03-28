import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';

import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UpdateUserPasswordUseCase } from '../../updateUserPassword.usecase';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('UpdateUserPasswordUseCase integration tests', () => {
  let sut: UpdateUserPasswordUseCase.UseCase;
  let repository: UserPrismaRepository;
  let module: TestingModule;
  let hashProvider: HashProvider;
  let prismaService: PrismaService;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        {
          provide: UserPrismaRepository,
          useFactory: (prismaService: PrismaService) => {
            return new UserPrismaRepository(prismaService);
          },
          inject: [PrismaService],
        },
      ],
    }).compile();

    repository = module.get<UserPrismaRepository>(UserPrismaRepository);
    hashProvider = new BcryptjsHashProvider();
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    sut = new UpdateUserPasswordUseCase.UseCase(repository, hashProvider);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await module.close();
  });

  it('Should throw error when user not found', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await expect(() =>
      sut.execute({
        id: entity._id,
        oldPassword: entity.password,
        password: 'newPass1234',
      }),
    ).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    );
  });

  it('Should throw error when oldPassword is not provided', async () => {
    const entity = new UserEntity(userDataBuilder({}));

    await prismaService.user.create({
      data: entity.toJson(),
    });

    await expect(() =>
      sut.execute({
        id: entity._id,
        oldPassword: '',
        password: 'newPass1234',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    );
  });

  it('Should throw error when password is not provided', async () => {
    const entity = new UserEntity(userDataBuilder({}));

    await prismaService.user.create({
      data: entity.toJson(),
    });

    await expect(() =>
      sut.execute({
        id: entity._id,
        oldPassword: entity.password,
        password: '',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    );
  });

  it('Should throw error when OldPassword do not match the user password', async () => {
    const oldPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(userDataBuilder({ password: oldPassword }));

    await prismaService.user.create({
      data: entity.toJson(),
    });

    await expect(() =>
      sut.execute({
        id: entity._id,
        oldPassword: 'fakePass',
        password: 'newPass123',
      }),
    ).rejects.toThrow(new InvalidPasswordError('Old password does not match'));
  });

  it('Should update user password', async () => {
    const oldPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(userDataBuilder({ password: oldPassword }));

    await prismaService.user.create({
      data: entity.toJson(),
    });

    const output = await sut.execute({
      id: entity._id,
      oldPassword: '1234',
      password: 'newPass123',
    });
    const res = await hashProvider.compareHash('newPass123', output.password);
    expect(res).toBeTruthy();
  });
});
