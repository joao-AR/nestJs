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
import { SigninDto } from '../../dto/signin-user.dto';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';

describe('UserController POST login e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let hashProvider: HashProvider;
  let signinDto: SigninDto;
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
    hashProvider = module.get<HashProvider>('hashProvider');
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    signinDto = {
      email: 't@t.com',
      password: 'Pass123',
    };

    await prismaService.user.deleteMany();
  });

  describe('POST /users/login', () => {
    it('Should authenticate a user', async () => {
      const passHash = await hashProvider.generateHash(signinDto.password);
      const entity = new UserEntity(
        userDataBuilder({ email: signinDto.email, password: passHash }),
      );
      repository.insert(entity);
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(200);

      expect(Object.keys(res.body)).toStrictEqual(['accessToken']);

      expect(typeof res.body.accessToken).toEqual('string');
    });

    it('Should return error with 422 code when request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({})
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('Should return error with 422 code when email is invalid', async () => {
      delete signinDto.email;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ]);
    });

    it('Should return error with 422 code when password is invalid', async () => {
      delete signinDto.password;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('Should return error with 404 code when email is not found', async () => {
      delete signinDto.email;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'fakeEmail@t.com',
          password: '1234',
        })
        .expect(404);

      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toEqual(
        'UserModel not found using email fakeEmail@t.com',
      );
    });

    it('Should return error with 400 code when password is incorrect', async () => {
      const passHash = await hashProvider.generateHash(signinDto.password);
      const entity = new UserEntity(
        userDataBuilder({ email: signinDto.email, password: passHash }),
      );
      repository.insert(entity);

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: signinDto.email,
          password: 'fakePass',
        })
        .expect(400);

      expect(res.body.error).toBe('Bad Request');
      expect(res.body.message).toEqual('Invalid credentials');
    });
  });
});
