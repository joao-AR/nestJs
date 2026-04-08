import { UpdateUserNameInput } from '@/users/application/usecases/updateUserName.usecase';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto implements Omit<UpdateUserNameInput, 'id'> {
  @ApiProperty({ description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
