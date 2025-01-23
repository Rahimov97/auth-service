import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users') 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({
    description: 'Данные для регистрации пользователя',
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Пример данных для регистрации',
        value: {
          username: 'newuser',
          password: 'password123',
        },
      },
    },
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;
    return this.usersService.create(username, password);
  }
}
