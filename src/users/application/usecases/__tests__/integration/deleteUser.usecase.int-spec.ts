import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeleteUserUseCase } from '../../deleteUser.usecase';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('DeleteUserUseCase integration tests', () => {
  let sut: DeleteUserUseCase.UseCase;
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(new PrismaClient())],
      providers: [
        {
          provide: UserPrismaRepository,
          useFactory: (prismaService: PrismaService) => {
            return new UserPrismaRepository(prismaService);
          },
          inject: [PrismaService],
        },
        {
          provide: DeleteUserUseCase.UseCase,
          useFactory: (userRepository: UserPrismaRepository) =>
            new DeleteUserUseCase.UseCase(userRepository),
          inject: [UserPrismaRepository],
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    sut = module.get<DeleteUserUseCase.UseCase>(DeleteUserUseCase.UseCase);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  it('Should throw error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('UserModel not found using ID fakeId'),
    );
  });

  it('Should delete an user', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJson(),
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
