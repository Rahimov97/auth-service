import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Secret Info') 
@Controller('api/secret-info')
export class SecretInfoController {
  private readonly logger = new Logger(SecretInfoController.name);

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение секретной информации' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getSecretInfo(@Request() req: any) {
    const username = req.user.username;
    this.logger.log(`Пользователь ${username} запросил секретную информацию`);
    return {
      message: 'Это секретная информация. Только для авторизованных пользователей!',
      user: req.user,
    };
  }
}
