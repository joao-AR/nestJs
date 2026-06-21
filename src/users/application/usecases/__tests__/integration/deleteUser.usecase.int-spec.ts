import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from '../../deleteUser.usecase';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserRepository } from '@/users/domain/repositories/user.repository';

describe('DeleteUserUseCase integration tests', () => {
  let sut: DeleteUserUseCase;
  let prismaService: PrismaService;
  let module: TestingModule;
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
          provide: DeleteUserUseCase,
          useFactory: (userRepository: UserRepository) =>
            new DeleteUserUseCase(userRepository),
          inject: ['UserRepository'],
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    sut = module.get<DeleteUserUseCase>(DeleteUserUseCase);
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

  it('Should throw error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('UserModel not found using ID fakeId'),
    );
  });

  it('Should delete an user', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roles, ...userData } = entity.toJson();
    await prismaService.user.create({
      data: userData,
    });

    await sut.execute({ id: entity._id });

    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });

    expect(output).toBeNull();

    const models = await prismaService.user.findMany();

    expect(models).toHaveLength(0);
  });
});
