import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class BaseDto {
  @ApiProperty({ description: 'Имя пользователя' }) 
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Пароль пользователя' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Идентификатор устройства' })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}
