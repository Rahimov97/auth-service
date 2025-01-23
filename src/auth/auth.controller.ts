import { Controller, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiBody({
    description: 'Данные для входа',
    type: LoginDto,
    examples: {
      example1: {
        summary: 'Пример успешного входа',
        value: {
          username: 'testuser',
          password: 'testpassword',
          deviceId: 'device-1',
        },
      },
    },
  }) 
  async login(@Body() loginDto: LoginDto) {
    const { username, password, deviceId } = loginDto;

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      this.logger.warn(`Неудачная попытка входа. Пользователь: ${username}`);
      throw new UnauthorizedException('Неверные учётные данные');
    }

    this.logger.log(`Успешный вход пользователя: ${username}, устройство: ${deviceId}`);
    return this.authService.login({ ...user, deviceId });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов' }) 
  @ApiBody({
    description: 'Данные для обновления токенов',
    type: RefreshTokenDto,
    examples: {
      example1: {
        summary: 'Пример запроса для обновления токенов',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          deviceId: 'device-1',
        },
      },
    },
  }) 
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken, deviceId } = refreshTokenDto;

    try {
      const newTokens = await this.authService.refresh(refreshToken, deviceId);
      this.logger.log(`Обновление токенов успешно. Устройство: ${deviceId}`);
      return newTokens;
    } catch (error) {
      this.logger.warn(`Неудачная попытка обновления токена. Устройство: ${deviceId}`);
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  @Post('revoke')
  @ApiOperation({ summary: 'Отозвать токен' })
  @ApiBearerAuth() 
  @ApiBody({
    description: 'Данные для отзыва токена',
    type: RefreshTokenDto,
    examples: {
      example1: {
        summary: 'Пример запроса для отзыва токена',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          deviceId: 'device-1',
        },
      },
    },
  }) 
  async revokeToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken, deviceId } = refreshTokenDto;

    try {
      await this.authService.revokeToken(refreshToken, deviceId);
      this.logger.log(`Токен для устройства ${deviceId} успешно отозван`);
      return { message: 'Токен успешно отозван' };
    } catch (error) {
      this.logger.warn(`Неудачная попытка отзыва токена. Устройство: ${deviceId}`);
      throw new UnauthorizedException('Не удалось отозвать токен');
    }
  }
}
