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
import { UserRepository } from '@/users/domain/repositories/user.repository';

describe('UpdateUserPasswordUseCase integration tests', () => {
  let sut: UpdateUserPasswordUseCase;
  let module: TestingModule;
  let hashProvider: HashProvider;
  let prismaService: PrismaService;
  let schemaId: string;

  beforeAll(async () => {
    const setupResult = setupPrismaTests();
    schemaId = setupResult.schemaId;
    process.env.DATABASE_URL = setupResult.isolatedDatabaseUrl;

    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        {
          provide: 'UserRepository',
          useFactory: (prismaService: PrismaService) => {
            return new UserPrismaRepository(prismaService);
          },
          inject: [PrismaService],
        },
        {
          provide: 'HashProvider',
          useClass: BcryptjsHashProvider,
        },
        {
          provide: UpdateUserPasswordUseCase,
          useFactory: (userRepository: UserRepository, hashProvider: HashProvider) => {
            return new UpdateUserPasswordUseCase(userRepository, hashProvider);
          },
          inject: ['UserRepository', 'HashProvider']
        }
      ],
    }).compile();

    hashProvider = module.get<HashProvider>('HashProvider');
    prismaService = module.get<PrismaService>(PrismaService);
    sut = module.get<UpdateUserPasswordUseCase>(UpdateUserPasswordUseCase);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE;`,
    );
    await prismaService.$disconnect();
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

    const { roles, ...userData } = entity.toJson();
    await prismaService.user.create({
      data: userData,
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

    const { roles, ...userData } = entity.toJson();
    await prismaService.user.create({
      data: userData,
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

    const { roles, ...userData } = entity.toJson();
    await prismaService.user.create({
      data: userData,
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

    const { roles, ...userData } = entity.toJson();
    await prismaService.user.create({
      data: userData,
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
