import { PrismaClient, User } from '@prisma/client';
import { UserModelMapper } from '../../user-module.mapper';
import { ValidationError } from '@/shared/domain/errors/validation-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';

describe('UserModelMapper integration tests', () => {
  let prismaService: PrismaClient;
  let props: any;
  beforeAll(async () => {
    setupPrismaTests();

    prismaService = new PrismaClient();
    await prismaService.$connect();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    props = {
      id: 'b825434a-4101-44b8-b27a-a7f52166f219',
      name: 'john Doe',
      email: 't@t.com',
      password: '123456',
      createdAt: new Date(),
    };
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('Should throw when user module is invalid', async () => {
    const model: User = Object.assign(props, { name: null });
    expect(() => UserModelMapper.toEntity(model)).toThrow(ValidationError);
  });

  it('Should convert a user module to a user entity', async () => {
    const model: User = await prismaService.user.create({
      data: props,
    });
    const sut = UserModelMapper.toEntity(model);
    expect(sut).toBeInstanceOf(UserEntity);
    expect(sut.toJson()).toStrictEqual(props);
  });
});
