import { UserOutputDto } from '../../../application/dto/user-output';
import { UsersController } from '../../users.controller';
import { SignUpOutput } from '@/users/application/usecases/signup.usecase';
import { SignupDto } from '../../dto/signup-user.dto';
import { SigninDto } from '../../dto/signin-user.dto';
import { UpdateUserNameOutput } from '@/users/application/usecases/updateUserName.usecase';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UpdateUserPasswordOutput } from '@/users/application/usecases/updateUserPassword.usecase';
import { UpdatePasswordDto } from '../../dto/update-password.dto';
import { GetUserOutput } from '@/users/application/usecases/getUser.usecase';
import { ListUsersOutput } from '@/users/application/usecases/listUsers.usecase';
import {
  UserCollectionPresenter,
  UserPresenter,
} from '@/users/presenters/user.presenter';
import { SignUpUseCase } from '@/users/application/usecases/signup.usecase';
import { SignInUseCase } from '@/users/application/usecases/signin.usecase';
import { UpdateUserUseCase } from '@/users/application/usecases/updateUserName.usecase';
import { UpdateUserPasswordUseCase } from '@/users/application/usecases/updateUserPassword.usecase';
import { DeleteUserUseCase } from '@/users/application/usecases/deleteUser.usecase';
import { GetUserUseCase } from '@/users/application/usecases/getUser.usecase';
import { ListUsersUseCase } from '@/users/application/usecases/listUsers.usecase';
import {
  AuthService,
  GenerateJwtProps,
} from '@/auth/infrastructure/services/auth.service';

import { Test, TestingModule } from '@nestjs/testing';

describe('UsersController', () => {
  let sut: UsersController;
  let mockSignupUseCase: jest.Mocked<SignUpUseCase>;
  let mockSigninUseCase: jest.Mocked<SignInUseCase>;
  let mockUpdateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let mockUpdateUserPasswordUseCase: jest.Mocked<UpdateUserPasswordUseCase>;
  let mockDeleteUserUseCase: jest.Mocked<DeleteUserUseCase>;
  let mockGetUserUseCase: jest.Mocked<GetUserUseCase>;
  let mockListUsersUseCase: jest.Mocked<ListUsersUseCase>;
  let mockAuthService: jest.Mocked<AuthService>;
  let id: string;
  let props: UserOutputDto;

  beforeAll(async () => {
    const mockSignupUseCaseProvider = {
      provide: SignUpUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockSigninUseCaseProvider = {
      provide: SignInUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockUpdateUserUseCaseProvider = {
      provide: UpdateUserUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockUpdateUserPasswordUseCaseProvider = {
      provide: UpdateUserPasswordUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockDeleteUserUseCaseProvider = {
      provide: DeleteUserUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockGetUserUseCaseProvider = {
      provide: GetUserUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockListUsersUseCaseProvider = {
      provide: ListUsersUseCase,
      useValue: {
        execute: jest.fn(),
      },
    };
    const mockAuthServiceProvider = {
      provide: AuthService,
      useValue: {
        generateJwt: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UsersController],
      providers: [
        mockSignupUseCaseProvider,
        mockSigninUseCaseProvider,
        mockUpdateUserUseCaseProvider,
        mockUpdateUserPasswordUseCaseProvider,
        mockDeleteUserUseCaseProvider,
        mockGetUserUseCaseProvider,
        mockListUsersUseCaseProvider,
        mockAuthServiceProvider,
      ],
    }).compile();

    sut = module.get(UsersController);
    mockSignupUseCase = module.get(SignUpUseCase);
    mockSigninUseCase = module.get(SignInUseCase);
    mockUpdateUserUseCase = module.get(UpdateUserUseCase);
    mockUpdateUserPasswordUseCase = module.get(UpdateUserPasswordUseCase);
    mockDeleteUserUseCase = module.get(DeleteUserUseCase);
    mockGetUserUseCase = module.get(GetUserUseCase);
    mockListUsersUseCase = module.get(ListUsersUseCase);
    mockAuthService = module.get(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    id = 'fake-id';
    props = {
      id: 'fake-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      createdAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('Should create a user', async () => {
    const output: SignUpOutput = props;

    mockSignupUseCase.execute.mockReturnValue(Promise.resolve(output));

    const input: SignupDto = {
      name: 'teste',
      email: 't@t.com',
      password: '1234',
    };

    const presenter = await sut.create(input);
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('Should authenticate a user', async () => {
    const fakeUser = {
      id: 'fake-id',
      name: 'test',
      email: 'test@example.com',
      password: 'hashed_password',
      createdAt: new Date(),
    };

    const expectedOutput: GenerateJwtProps = {
      accessToken: 'fake_token',
    };

    const input: SigninDto = {
      email: 't@t.com',
      password: '1234',
    };

    mockSigninUseCase.execute.mockResolvedValue(fakeUser);
    mockAuthService.generateJwt.mockResolvedValue(expectedOutput);

    const res = await sut.login(input);
    expect(res).toEqual(expectedOutput);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthService.generateJwt).toHaveBeenCalledWith(fakeUser.id);
  });

  it('Should update a user', async () => {
    const expectedOutput: UpdateUserNameOutput = props;

    mockUpdateUserUseCase.execute.mockResolvedValue(expectedOutput);

    const input: UpdateUserDto = {
      name: 'updated Name',
    };

    const presenter = await sut.update(id, input);
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(expectedOutput));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });

  it('Should update the user password', async () => {
    const output: UpdateUserPasswordOutput = props;

    mockUpdateUserPasswordUseCase.execute.mockResolvedValue(output);

    const input: UpdatePasswordDto = {
      password: 'newPass',
      oldPassword: 'oldPass',
    };

    const presenter = await sut.updatePassword(id, input);
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUpdateUserPasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });

  it('Should delete an user', async () => {
    const output = undefined;

    mockDeleteUserUseCase.execute.mockResolvedValue(output);

    const res = await sut.remove(id);
    expect(output).toStrictEqual(res);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id });
  });

  it('Should get an user', async () => {
    const output: GetUserOutput = props;

    mockGetUserUseCase.execute.mockResolvedValue(output);

    const presenter = await sut.findOne(id);
    expect(presenter).toBeInstanceOf(UserPresenter);
    expect(presenter).toStrictEqual(new UserPresenter(output));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({ id });
  });

  it('Should list users', async () => {
    const output: ListUsersOutput = {
      items: [props],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    };

    mockListUsersUseCase.execute.mockResolvedValue(output);

    const searchParams = {
      page: 1,
      perPage: 1,
    };

    const presenter = await sut.search(searchParams);
    expect(presenter).toBeInstanceOf(UserCollectionPresenter);
    expect(presenter).toStrictEqual(new UserCollectionPresenter(output));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams);
  });
});
