import { BaseDto } from '../../dto/base.dto';

export class LoginDto extends BaseDto {
  username: string;
  password: string;
  deviceId: string;
}
