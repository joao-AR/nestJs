import { Module } from '@nestjs/common';
import { SignUpUseCase } from '../application/usecases/signup.usecase';
import { BcryptjsHashProvider } from './providers/hash-provider/bcryptjs-hash.provider';
import { UserRepository } from '../domain/repositories/user.repository';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { SignInUseCase } from '../application/usecases/signin.usecase';
import { GetUserUseCase } from '../application/usecases/getUser.usecase';
import { ListUsersUseCase } from '../application/usecases/listUsers.usecase';
import { UpdateUserUseCase } from '../application/usecases/updateUserName.usecase';
import { UpdateUserPasswordUseCase } from '../application/usecases/updateUserPassword.usecase';
import { DeleteUserUseCase } from '../application/usecases/deleteUser.usecase';
import { UsersController } from './users.controller';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from './databases/prisma/repositories/user-prisma.repository';
import { AuthModule } from '@/auth/infrastructure/auth.module';

const userRep = {
  provide: 'UserRepository',
  useFactory: (prismaService: PrismaService) => {
    return new UserPrismaRepository(prismaService);
  },
  inject: [PrismaService],
};

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    userRep,
    {
      provide: 'hashProvider',
      useClass: BcryptjsHashProvider,
    },
    {
      provide: SignUpUseCase,
      useFactory: (
        userRepository: UserRepository,
        hashProvider: HashProvider,
      ) => {
        return new SignUpUseCase(userRepository, hashProvider);
      },
      inject: ['UserRepository', 'hashProvider'],
    },
    {
      provide: SignInUseCase,
      useFactory: (
        userRepository: UserRepository,
        hashProvider: HashProvider,
      ) => {
        return new SignInUseCase(userRepository, hashProvider);
      },
      inject: ['UserRepository', 'hashProvider'],
    },
    {
      provide: GetUserUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new GetUserUseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: ListUsersUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new ListUsersUseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new UpdateUserUseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: UpdateUserPasswordUseCase,
      useFactory: (
        userRepository: UserRepository,
        hashProvider: HashProvider,
      ) => {
        return new UpdateUserPasswordUseCase(userRepository, hashProvider);
      },
      inject: ['UserRepository', 'hashProvider'],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepository: UserRepository) => {
        return new DeleteUserUseCase(userRepository);
      },
      inject: ['UserRepository'],
    },
  ],
})
export class UsersModule {}
