import { UpdatePasswordDto } from './../../dto/update-password.dto';
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
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { AuthService } from '@/auth/infrastructure/auth.service';

describe('UserController PATCH e2e tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository;
  let updatePasswordDto: UpdatePasswordDto;

  let prismaService: PrismaService;
  let hashProvider: HashProvider;
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
    hashProvider = module.get<HashProvider>('hashProvider');
    authService = module.get<AuthService>(AuthService);
  });

  beforeEach(async () => {
    updatePasswordDto = {
      password: 'new_pass',
      oldPassword: 'old_pass',
    };

    await prismaService.user.deleteMany();
    const hashedPassword = await hashProvider.generateHash('old_pass');
    entity = new UserEntity(userDataBuilder({ password: hashedPassword }));
    await repository.insert(entity);
    const jwt = await authService.generateJwt(entity.id);
    accessToken = jwt.accessToken;
  });

  describe('PATCH /users/:id', () => {
    it('Should update a user password', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(200);

      const user = await repository.findById(entity.id);

      const checkNewsPass = await hashProvider.compareHash(
        'new_pass',
        user.password,
      );

      expect(checkNewsPass).toBeTruthy();
    });

    it('Should return error with 401 code when user is not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .send(updatePasswordDto)
        .expect(401);
    });

    it('Should return error with 422 code when request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ]);
    });

    it('Should return error with 404 code when id is invalid', async () => {
      await request(app.getHttpServer())
        .patch('/users/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeId',
        });
    });

    it('Should return error with 422 code when request oldPassword is not provided', async () => {
      delete updatePasswordDto.oldPassword;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ]);
    });

    it('Should return error with 422 code when request password is not provided', async () => {
      delete updatePasswordDto.password;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(422);

      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('Should return error with 422 code when password does not match ', async () => {
      updatePasswordDto.oldPassword = 'fakePass';
      await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Old password does not match',
        });
    });
  });
});
