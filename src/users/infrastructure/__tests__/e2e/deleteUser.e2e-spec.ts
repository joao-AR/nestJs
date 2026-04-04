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
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('UserController DELETE e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository;
  let prismaService: PrismaService;

  let entity: UserEntity;
  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [EnvConfigModule, UsersModule, DatabaseModule],
    }).compile();

    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();

    repository = module.get<UserRepository>('UserRepository');
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    entity = new UserEntity(userDataBuilder({}));
    await repository.insert(entity);
  });

  describe('DELETE /users/:id', () => {
    it('Should delete a user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${entity._id}`)
        .expect(204)
        .expect({});
    });

    it('Should return error with 404 code when id is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/users/fakeId')
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeId',
        });
    });
  });
});
