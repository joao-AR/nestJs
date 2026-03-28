import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdateUserUseCase } from '../../updateUserName.usecase';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('UpdateUserUseCase integration tests', () => {
  let sut: UpdateUserUseCase.UseCase;
  let repository: UserPrismaRepository;
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    sut = new UpdateUserUseCase.UseCase(repository);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await module.close();
  });

  it('Should throw error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'new name' }),
    ).rejects.toThrow(new NotFoundError('UserModel not found using ID fakeId'));
  });

  it('Should update an user', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    const output = await sut.execute({ id: entity._id, name: 'New name' });

    expect(output.name).toBe('New name');
  });
});
