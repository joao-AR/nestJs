import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/databases/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpUseCase } from '../../signup.usecase';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service';
import { UserRepository } from '@/users/domain/repositories/user.repository';

describe('SignUpUseCase integration tests', () => {
  let sut: SignUpUseCase;
  let module: TestingModule;
  let hashProvider: HashProvider;
  let prismaService: PrismaService;
  let schemaId: string;

  beforeAll(async () => {
    const setupResult = setupPrismaTests();
    schemaId = setupResult.schemaId;
    process.env.DATABASE_URL = setupResult.isolatedDatabaseUrl;

    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        {
          provide: 'UserRepository',
          useFactory: (prismaService: PrismaService) => {
            return new UserPrismaRepository(prismaService);
          },
          inject: [PrismaService],
        },
        {
          provide: 'HashProvider',
          useClass: BcryptjsHashProvider,
        },
        {
          provide: SignUpUseCase,
          useFactory: (userRepository: UserRepository, hashProvider: HashProvider) => {
            return new SignUpUseCase(userRepository, hashProvider);
          },
          inject: ['UserRepository', 'HashProvider']
        }
      ],
    }).compile();

    hashProvider = module.get<HashProvider>('HashProvider');
    prismaService = module.get<PrismaService>(PrismaService);
    sut = module.get<SignUpUseCase>(SignUpUseCase);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaId}" CASCADE;`,
    );
    await prismaService.$disconnect();
    await module.close();
  });

  it('Should create a user', async () => {
    const props = {
      name: 'test name',
      email: 't@t.com',
      password: '123',
    };

    const output = await sut.execute(props);

    expect(output.id).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);
  });
});
