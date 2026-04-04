import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { SignInUseCase } from '../../signin.usecase';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('SignInUseCase integration tests', () => {
  let sut: SignInUseCase;
  let repository: UserPrismaRepository;
  let hashProvider: HashProvider;
  let module: TestingModule;
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
    sut = new SignInUseCase(repository, hashProvider);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await module.close();
  });

  it('Should throw error when user email is not found', async () => {
    await expect(() =>
      sut.execute({ email: 't@t.com', password: '1234' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('Should throw error when user password does not match', async () => {
    const userPass = await hashProvider.generateHash('1234');
    const entity = new UserEntity(userDataBuilder({ password: userPass }));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    await expect(() =>
      sut.execute({
        email: entity.email,
        password: 'fakePass',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('Should throw error when email is not provided', async () => {
    await expect(() =>
      sut.execute({ email: '', password: '1234' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('Should throw error when password is not provided', async () => {
    await expect(() =>
      sut.execute({ email: 't@t.com', password: '' }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('Should authenticate an user', async () => {
    const userPass = await hashProvider.generateHash('1234');

    const entity = new UserEntity(userDataBuilder({ password: userPass }));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    const output = await sut.execute({
      email: entity.email,
      password: '1234',
    });

    expect(output).toMatchObject(entity.toJson());
  });
});
