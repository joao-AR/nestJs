import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserRepository } from '@/users/domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { UsersController } from '../../users.controller';
import { instanceToPlain } from 'class-transformer';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { AuthService } from '@/auth/infrastructure/services/auth.service';

describe('UserController PUT e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository;
  let updateUserDto: UpdateUserDto;
  let prismaService: PrismaService;
  let entity: UserEntity;
  let accessToken: string;
  let authService: AuthService;

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
    authService = module.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    updateUserDto = {
      name: 'new Name',
    };

    await prismaService.user.deleteMany();
    entity = new UserEntity(userDataBuilder({}));
    await repository.insert(entity);

    const jwt = await authService.generateJwt(entity.id);
    accessToken = jwt.accessToken;
  });

  describe('PUT /users/:id', () => {
    it('Should update a user', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(200);

      const user = await repository.findById(entity.id);

      const presenter = UsersController.userToResponse(user.toJson());
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });

    it('Should return error with 422 code when request body is invalid', async () => {
      delete updateUserDto.name;
      const res = await request(app.getHttpServer())
        .put(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ]);
    });

    it('Should return error with 404 code when id is invalid', async () => {
      await request(app.getHttpServer())
        .put('/users/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeId',
        });
    });

    it('Should return error with 401 code when user is not authenticated', async () => {
      await request(app.getHttpServer())
        .put('/users/fakeId')
        .send(updateUserDto)
        .expect(401);
    });
  });
});
