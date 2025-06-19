import { password } from '@inquirer/prompts';
import { UserOutputDto } from './../../../application/dto/user-output';
import { UsersController } from '../../users.controller';
import { SignUpUseCase } from '@/users/application/usecases/signup.usecase';
import { SignupDto } from '../../dto/signup-user.dto';
import { SignInUseCase } from '@/users/application/usecases/signin.usecase';
import { SigninDto } from '../../dto/signin-user.dto';
import { UpdateUserUseCase } from '@/users/application/usecases/updateUserName.usecase';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UpdateUserPasswordUseCase } from '@/users/application/usecases/updateUserPassword.usecase';
import { UpdatePasswordDto } from '../../dto/update-password.dto';
import { GetUserUseCase } from '@/users/application/usecases/getUser.usecase';
import { ListUsersUseCase } from '@/users/application/usecases/listUsers.usecase';

describe('UsersController', () => {
  let sut: UsersController;
  let id: string;
  let props: UserOutputDto;

  beforeEach(() => {
    sut = new UsersController();
    id = '6bef9a73-bea9-447c-8eed-04425e59194c';
    props = {
      id,
      name: 'teste',
      email: 't@t.com',
      password: '1234',
      createdAt: new Date(),
    };
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should create a user', async () => {
    const output: SignUpUseCase.Output = props;

    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['signupUseCase'] = mockSignupUseCase as any;

    const input: SignupDto = {
      name: 'teste',
      email: 't@t.com',
      password: '1234',
    };

    const res = await sut.create(input);
    expect(output).toMatchObject(res);
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('should authenticate a user', async () => {
    const output: SignInUseCase.Output = props;

    const mockSigninUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['signinUseCase'] = mockSigninUseCase as any;

    const input: SigninDto = {
      email: 't@t.com',
      password: '1234',
    };

    const res = await sut.login(input);
    expect(output).toMatchObject(res);
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input);
  });

  it('should update a user', async () => {
    const output: UpdateUserUseCase.Output = props;

    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['updateUserUseCase'] = mockUpdateUserUseCase as any;

    const input: UpdateUserDto = {
      name: 'updated Name',
    };

    const res = await sut.update(id, input);
    expect(output).toMatchObject(res);
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });

  it('should update users password', async () => {
    const output: UpdateUserPasswordUseCase.Output = props;

    const mockUpdateUserPasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['updateUserPasswordUseCase'] = mockUpdateUserPasswordUseCase as any;

    const input: UpdatePasswordDto = {
      password: 'newPass',
      oldPassword: 'oldPass',
    };

    const res = await sut.updatePassword(id, input);
    expect(output).toMatchObject(res);
    expect(mockUpdateUserPasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    });
  });

  it('should delete a user', async () => {
    const output = undefined;

    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any;

    const res = await sut.remove(id);
    expect(output).toStrictEqual(res);
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id });
  });

  it('should get a user', async () => {
    const output: GetUserUseCase.Output = props;

    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['getUserUseCase'] = mockGetUserUseCase as any;

    const res = await sut.findOne(id);
    expect(output).toStrictEqual(res);
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({ id });
  });

  it('should list users', async () => {
    const output: ListUsersUseCase.Output = {
      items: [props],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    };

    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    sut['listUsersUseCase'] = mockListUsersUseCase as any;

    const searchParams = {
      page: 1,
      perPage: 1,
    };

    const res = await sut.search(searchParams);
    expect(output).toStrictEqual(res);
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams);
  });
});
