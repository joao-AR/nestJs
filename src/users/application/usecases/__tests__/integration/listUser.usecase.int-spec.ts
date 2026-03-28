import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { ListUsersUseCase } from '../../listUsers.usecase';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('ListUsersUseCase integration tests', () => {
  let sut: ListUsersUseCase.UseCase;
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
    sut = new ListUsersUseCase.UseCase(repository);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await module.close();
  });

  it('Should return users by createdAt', async () => {
    const createdAt = new Date();
    const entities: UserEntity[] = [];
    const arrange = Array(3).fill(userDataBuilder({}));

    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...element,
          email: `t${index}@t.com`,
          createdAt: new Date(createdAt.getTime() + index),
        }),
      );
    });

    await prismaService.user.createMany({
      data: entities.map(item => item.toJson()),
    });

    const output = await sut.execute({});

    expect(output).toStrictEqual({
      items: entities.reverse().map(item => item.toJson()),
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  it('Should return output using filter, sort and paginate', async () => {
    const createdAt = new Date();
    const entities: UserEntity[] = [];
    const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];

    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...userDataBuilder({ name: element }),
          createdAt: new Date(createdAt.getTime() + index),
        }),
      );
    });

    await prismaService.user.createMany({
      data: entities.map(item => item.toJson()),
    });

    const output = await sut.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    });

    expect(output).toMatchObject({
      items: [entities[0].toJson(), entities[4].toJson()],
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });
  });
});
