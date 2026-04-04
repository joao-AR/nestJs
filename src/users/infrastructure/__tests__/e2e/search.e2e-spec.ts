import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { instanceToPlain } from 'class-transformer';
import { UsersController } from '../../users.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('UserController GET e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prismaService: PrismaService;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [EnvConfigModule, UsersModule, DatabaseModule],
    }).compile();

    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  describe('GET /users/', () => {
    it('Should get a list of users ordered by createdAt', async () => {
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

      const searchParams = {};
      const queryParams = new URLSearchParams(searchParams as any).toString();

      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .expect(200);

      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [
          ...entities
            .reverse()
            .map(item => instanceToPlain(UsersController.userToResponse(item))),
        ],
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 15,
          lastPage: 1,
        },
      });
    });

    it('Should get a list of users ordered by query params', async () => {
      const createdAt = new Date();
      const entities: UserEntity[] = [];
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt'];
      arrange.forEach((name, index) => {
        entities.push(
          new UserEntity({
            ...userDataBuilder({}),
            name,
            email: `t${index}@t.com`,
            createdAt: new Date(createdAt.getTime() + index),
          }),
        );
      });

      await prismaService.user.createMany({
        data: entities.map(item => item.toJson()),
      });

      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      };

      const queryParams = new URLSearchParams(searchParams as any).toString();

      const res = await request(app.getHttpServer())
        .get(`/users/?${queryParams}`)
        .expect(200);

      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta']);
      expect(res.body).toStrictEqual({
        data: [entities[0], entities[4]].map(item =>
          instanceToPlain(UsersController.userToResponse(item)),
        ),
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 2,
          lastPage: 2,
        },
      });
    });

    it('Should return error with 422 code when query params is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/?fakeId=123')
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual(['property fakeId should not exist']);
    });
  });
});
