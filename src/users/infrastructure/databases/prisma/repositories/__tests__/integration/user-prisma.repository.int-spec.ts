import { UserPrismaRepository } from '../../user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { ConflictError } from '@/shared/domain/errors/conflict-error';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UsersModule } from '@/users/infrastructure/users.module';

describe('UserPrismaRepository integration tests', () => {
  let sut: UserPrismaRepository;
  let module: TestingModule;
  let prismaService: PrismaService;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule],
    }).compile();

    sut = module.get<UserPrismaRepository>('UserRepository');
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  it('Should throw when entity not found', async () => {
    await expect(() => sut.findById('FakeId')).rejects.toThrow(
      new NotFoundError('UserModel not found using ID FakeId'),
    );
  });

  it('Should should find a entity by id', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJson(),
    });
    const output = await sut.findById(newUser.id);
    expect(output.toJson()).toStrictEqual(entity.toJson());
  });

  it('Should insert a new entity', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await sut.insert(entity);

    const res = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });

    expect(res).toStrictEqual(entity.toJson());
  });

  it('Should find all users', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    const newUser = await prismaService.user.create({
      data: entity.toJson(),
    });

    const entities = await sut.findAll();

    expect(entities).toHaveLength(1);
    entities.map(item => expect(item.toJson()).toStrictEqual(entity.toJson()));
  });

  it('Should throw on update when entity not found', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    );
  });

  it('Should update an entity', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    entity.updateName('New Name');
    await sut.update(entity);
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });

    expect(output.name).toBe('New Name');
  });

  it('Should throw on delete when entity not found', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await expect(() => sut.delete(entity._id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    );
  });

  it('Should delete an entity', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    await sut.delete(entity._id);
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    });

    expect(output).toBeNull();
  });

  it('Should throw on find by email when entity not found', async () => {
    await expect(() => sut.findByEmail('t@t.com')).rejects.toThrow(
      new NotFoundError(`UserModel not found using email t@t.com`),
    );
  });

  it('Should find an entity by email', async () => {
    const entity = new UserEntity(userDataBuilder({ email: 't@t.com' }));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    const output = await sut.findByEmail(entity.email);

    expect(output.toJson()).toStrictEqual(entity.toJson());
  });

  it('Should throw on emailExists when entity is found', async () => {
    const entity = new UserEntity(userDataBuilder({ email: 't@t.com' }));
    await prismaService.user.create({
      data: entity.toJson(),
    });

    await expect(() => sut.emailExists('t@t.com')).rejects.toThrow(
      new ConflictError('Email address already in use'),
    );
  });

  it('Should not find a entity by email', async () => {
    expect.assertions(0);
    await sut.emailExists('t@t.com');
  });

  describe('Search method tests', () => {
    it('Should apply only pagination when other params are null', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = Array(16).fill(userDataBuilder({}));

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

      const searchOutput = await sut.search(new UserRepository.SearchParams());

      const itens = searchOutput.items;
      expect(searchOutput).toBeInstanceOf(UserRepository.SearchResult);
      expect(searchOutput.total).toBe(16);
      expect(searchOutput.items.length).toBe(15);
      searchOutput.items.forEach(item =>
        expect(item).toBeInstanceOf(UserEntity),
      );

      itens.reverse().forEach((item, index) => {
        expect(`t${index + 1}@t.com`).toBe(item.email);
      });
    });

    it('Should search using filter, sort and paginate', async () => {
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

      const searchOutputPage1 = await sut.search(
        new UserRepository.SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      );

      expect(searchOutputPage1.items[0].toJson()).toMatchObject(
        entities[0].toJson(),
      );
      expect(searchOutputPage1.items[1].toJson()).toMatchObject(
        entities[4].toJson(),
      );

      const searchOutputPage2 = await sut.search(
        new UserRepository.SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      );

      expect(searchOutputPage2.items[0].toJson()).toMatchObject(
        entities[2].toJson(),
      );
    });
  });
});
