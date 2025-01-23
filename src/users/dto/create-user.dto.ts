import { PickType } from '@nestjs/mapped-types';
import { BaseDto } from '../../dto/base.dto';

export class CreateUserDto extends PickType(BaseDto, ['username', 'password'] as const) {}
