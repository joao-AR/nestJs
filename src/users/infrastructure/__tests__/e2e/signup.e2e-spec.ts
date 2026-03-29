import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { SignupDto } from '../../dto/signup-user.dto';
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
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('UserController POST e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let signupDto: SignupDto;
  let prismaService: PrismaService;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [EnvConfigModule, UsersModule, DatabaseModule],
    }).compile();

    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();

    repository = module.get<UserRepository.Repository>('UserRepository');
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    signupDto = {
      name: 'test Name',
      email: 't@t.com',
      password: 'Pass123',
    };

    await prismaService.user.deleteMany();
  });

  describe('POST /users', () => {
    it('Should create a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(201);

      expect(Object.keys(res.body)).toStrictEqual(['data']);

      const user = await repository.findById(res.body.data.id);
      const presenter = UsersController.userToResponse(user.toJson());
      const serialized = instanceToPlain(presenter);

      expect(res.body.data).toStrictEqual(serialized);
    });

    it('Should return error with 422 code when request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({})
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('Should return error with 422 code when name field is invalid', async () => {
      delete signupDto.name;
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ]);
    });

    it('Should return error with 422 code when email is invalid', async () => {
      delete signupDto.email;
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ]);
    });

    it('Should return error with 422 code when password is invalid', async () => {
      delete signupDto.password;
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('Should return error with 422 code when invalid field is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ ...signupDto, fakeField: 'true' })
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual(['property fakeField should not exist']);
    });

    it('Should return error with 409 code when invalid email is already in use', async () => {
      const entity = new UserEntity(userDataBuilder({ ...signupDto }));
      await repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(409)
        .expect({
          statusCode: 409,
          error: 'Conflict',
          message: 'Email address already in use',
        });
    });
  });
});
