import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'default_secret');
    this.accessTokenExpiration = this.configService.get<string>('ACCESS_TOKEN_EXPIRATION', '1h');
    this.refreshTokenExpiration = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION', '7d');
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      this.logger.log(`Пользователь ${username} успешно прошёл проверку`);
      return result;
    }
    this.logger.warn(`Ошибка проверки пользователя ${username}`);
    return null;
  }

  async login(user: any) {
    const jti = randomUUID();
    const payload = { username: user.username, sub: user.id, deviceId: user.deviceId, jti };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.accessTokenExpiration });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.refreshTokenExpiration });

    await this.usersService.saveRefreshToken(refreshToken, user.deviceId, user, jti);

    this.logger.log(`Пользователь ${user.username} успешно вошёл в систему с устройством ${user.deviceId}`);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string, deviceId: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.jwtSecret });

      if (payload.deviceId !== deviceId) {
        this.logger.warn(`Несоответствие устройства. Ожидаемое устройство: ${payload.deviceId}, полученное: ${deviceId}`);
        throw new UnauthorizedException('Устройство не совпадает');
      }

      const user = await this.usersService.findByUsername(payload.username);
      if (!user) {
        this.logger.warn(`Пользователь ${payload.username} не найден`);
        throw new UnauthorizedException('Неверный пользователь');
      }

      const tokenExists = await this.usersService.findRefreshTokenByJti(payload.jti);
      if (!tokenExists || tokenExists.revoked) {
        await this.usersService.revokeTokensForDevice(user.id, deviceId);
        this.logger.warn(`Все токены для устройства ${deviceId} отозваны`);
        throw new UnauthorizedException('Токен был отозван');
      }

      this.logger.log(`Обновление токенов для пользователя ${payload.username} успешно выполнено`);
      return this.login({ userId: user.id, username: user.username, deviceId });
    } catch (error) {
      this.logger.warn(`Ошибка обновления токенов: ${error.message}`);
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  async revokeToken(refreshToken: string, deviceId: string): Promise<void> {
    const token = await this.usersService.findRefreshToken(refreshToken, deviceId);
    if (!token) {
      this.logger.warn(`Попытка отзыва несуществующего токена. Устройство: ${deviceId}`);
      throw new UnauthorizedException('Токен не найден');
    }
    await this.usersService.revokeRefreshToken(refreshToken);
    this.logger.log(`Токен для устройства ${deviceId} успешно отозван`);
  }
}
