import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
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
import { ListUsersUseCase } from '../application/usecases/listUsers.usecase';
import { SigninDto } from './dto/signin-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  @Inject(SignUpUseCase.UseCase)
  private signupUseCase: SignUpUseCase.UseCase;

  @Inject(SignInUseCase.UseCase)
  private signinUseCase: SignInUseCase.UseCase;

  @Inject(UpdateUserUseCase.UseCase)
  private updateUserUseCase: UpdateUserUseCase.UseCase;

  @Inject(UpdateUserPasswordUseCase.UseCase)
  private updateUserPasswordUseCase: UpdateUserPasswordUseCase.UseCase;

  @Inject(DeleteUserUseCase.UseCase)
  private deleteUserUseCase: DeleteUserUseCase.UseCase;

  @Inject(GetUserUseCase.UseCase)
  private getUserUseCase: GetUserUseCase.UseCase;

  @Inject(ListUsersUseCase.UseCase)
  private listUsersUseCase: ListUsersUseCase.UseCase;

  @HttpCode(200)
  @Post()
  async create(@Body() signupDto: SignupDto) {
    return await this.signupUseCase.execute(signupDto);
  }

  @Post('login')
  async login(@Body() signinDto: SigninDto) {
    return await this.signinUseCase.execute(signinDto);
  }

  @Get()
  async search(@Query() searchPrams: ListUsersDto) {
    return await this.listUsersUseCase.execute(searchPrams);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.getUserUseCase.execute({ id });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.updateUserUseCase.execute({ id, ...updateUserDto });
  }

  @Patch(':id')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.updateUserPasswordUseCase.execute({
      id,
      ...updatePasswordDto,
    });
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteUserUseCase.execute({ id });
  }
}
