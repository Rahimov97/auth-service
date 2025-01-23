import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ username, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  async saveRefreshToken(token: string, deviceId: string, user: User, jti: string): Promise<void> {
    const existingToken = await this.refreshTokenRepository.findOne({
      where: { deviceId, user: { id: user.id } },
    });

    if (existingToken) {
      existingToken.token = token;
      existingToken.jti = jti;
      existingToken.revoked = false; 
      await this.refreshTokenRepository.save(existingToken);
    } else {
      const refreshToken = this.refreshTokenRepository.create({
        token,
        deviceId,
        user,
        jti,
      });
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async findRefreshToken(token: string, deviceId: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token, deviceId, revoked: false }, 
    });
  }

  async findRefreshTokenByJti(jti: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { jti, revoked: false },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { revoked: true });
  }

  async revokeAllTokensForUser(userId: number): Promise<void> {
    await this.refreshTokenRepository.update({ user: { id: userId } }, { revoked: true });
  }

  async revokeTokensForDevice(userId: number, deviceId: string): Promise<void> {
    await this.refreshTokenRepository.update({ user: { id: userId }, deviceId }, { revoked: true });
  }
}
