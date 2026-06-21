import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdateUserUseCase } from '../../updateUserName.usecase';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserRepository } from '@/users/domain/repositories/user.repository';

describe('UpdateUserUseCase integration tests', () => {
  let sut: UpdateUserUseCase;
  let module: TestingModule;
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
          provide: UpdateUserUseCase,
          useFactory: (userRepository: UserRepository) => {
            return new UpdateUserUseCase(userRepository);
          },
          inject: ['UserRepository']
        }
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    sut = module.get<UpdateUserUseCase>(UpdateUserUseCase);
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
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'new name' }),
    ).rejects.toThrow(new NotFoundError('UserModel not found using ID fakeId'));
  });

  it('Should update an user', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    const { roles, ...userData } = entity.toJson();
    await prismaService.user.create({
      data: userData,
    });

    const output = await sut.execute({ id: entity._id, name: 'New name' });

    expect(output.name).toBe('New name');
  });
});
