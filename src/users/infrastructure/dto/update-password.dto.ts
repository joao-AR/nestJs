import { UpdateUserPasswordInput } from '@/users/application/usecases/updateUserPassword.usecase';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto implements Omit<UpdateUserPasswordInput, 'id'> {
  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User old password' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
