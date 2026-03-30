import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SignupDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpUseCase } from '../application/usecases/signup.usecase';
import { SignInUseCase } from '../application/usecases/signin.usecase';
import { UpdateUserUseCase } from '../application/usecases/updateUserName.usecase';
import { DeleteUserUseCase } from '../application/usecases/deleteUser.usecase';
import { GetUserUseCase } from '../application/usecases/getUser.usecase';
import { UpdateUserPasswordUseCase } from '../application/usecases/updateUserPassword.usecase';
import {
  ListUsersUseCase,
  ListUsersOutput,
} from '../application/usecases/listUsers.usecase';
import { SigninDto } from './dto/signin-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserOutputDto } from '../application/dto/user-output';
import {
  UserCollectionPresenter,
  UserPresenter,
} from '../presenters/user.presenter';
import { AuthService } from '@/auth/infrastructure/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private signupUseCase: SignUpUseCase,
    private signinUseCase: SignInUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private updateUserPasswordUseCase: UpdateUserPasswordUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
    private getUserUseCase: GetUserUseCase,
    private listUsersUseCase: ListUsersUseCase,
    private authService: AuthService,
  ) {}

  static userToResponse(output: UserOutputDto) {
    return new UserPresenter(output);
  }

  static listUsersToResponse(output: ListUsersOutput) {
    return new UserCollectionPresenter(output);
  }

  @HttpCode(201)
  @Post()
  async create(@Body() signupDto: SignupDto) {
    const output = await this.signupUseCase.execute(signupDto);
    return UsersController.userToResponse(output);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() signinDto: SigninDto) {
    const output = await this.signinUseCase.execute(signinDto);
    return this.authService.generateJwt(output.id);
  }

  @Get()
  async search(@Query() searchPrams: ListUsersDto) {
    const output = await this.listUsersUseCase.execute(searchPrams);
    return UsersController.listUsersToResponse(output);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const output = await this.getUserUseCase.execute({ id });
    return UsersController.userToResponse(output);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const output = await this.updateUserUseCase.execute({
      id,
      ...updateUserDto,
    });
    return UsersController.userToResponse(output);
  }

  @Patch(':id')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const output = await this.updateUserPasswordUseCase.execute({
      id,
      ...updatePasswordDto,
    });

    return UsersController.userToResponse(output);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUserUseCase.execute({ id });
  }
}
