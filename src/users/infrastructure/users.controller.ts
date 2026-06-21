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
  UseGuards,
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
import { AuthService } from '@/auth/infrastructure/services/auth.service';
import { AuthGuard } from '@/auth/infrastructure/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Roles } from '@/shared/infrastructure/decorators/Roles.decorator';
import { UserOwnershipGuard } from '@/auth/infrastructure/guards/user-ownership.guard';
@ApiTags('users')
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

  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid request body',
  })
  @HttpCode(201)
  @Post()
  async create(@Body() signupDto: SignupDto) {
    const output = await this.signupUseCase.execute(signupDto);
    return UsersController.userToResponse(output);
  }

  @ApiResponse({
    status: 200,
    description: 'Success Login',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: { $ref: getSchemaPath(UserPresenter) },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body() signinDto: SigninDto) {
    const response = await this.signinUseCase.execute(signinDto);
    const UserOutput = UsersController.userToResponse(response);
    const accessToken = await this.authService.generateJwt(
      response.id,
      response.roles || [],
    );
    const output = {
      ...accessToken,
      user: { ...UserOutput },
    };
    return output;
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
            },
            currentPage: {
              type: 'number',
            },
            lastPage: {
              type: 'number',
            },
            perPage: {
              type: 'number',
            },
          },
        },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(UserPresenter) },
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid Search params',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get()
  @UseGuards(AuthGuard)
  @Roles(['admin'])
  async search(@Query() searchPrams: ListUsersDto) {
    const output = await this.listUsersUseCase.execute(searchPrams);
    return UsersController.listUsersToResponse(output);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: { $ref: getSchemaPath(UserPresenter) },
          },
        },
      },
    },
  })
  @Get(':userId')
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard, UserOwnershipGuard)
  async findOne(@Param('userId') id: string) {
    const output = await this.getUserUseCase.execute({ id });
    const user = UsersController.userToResponse(output);

    return { user };
  }

  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: { $ref: getSchemaPath(UserPresenter) },
          },
        },
      },
    },
  })
  @Put(':userId')
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard, UserOwnershipGuard)
  async update(
    @Param('userId') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const output = await this.updateUserUseCase.execute({
      id,
      ...updateUserDto,
    });
    const user = UsersController.userToResponse(output);
    return { user };
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid request body',
  })
  @Patch(':userId')
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard, UserOwnershipGuard)
  async updatePassword(
    @Param('userId') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const output = await this.updateUserPasswordUseCase.execute({
      id,
      ...updatePasswordDto,
    });

    return UsersController.userToResponse(output);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Exclusion Success',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @HttpCode(204)
  @Delete(':userId')
  @UseGuards(AuthGuard, UserOwnershipGuard)
  @Roles(['user', 'admin'])
  async remove(@Param('userId') id: string) {
    await this.deleteUserUseCase.execute({ id });
  }
}
