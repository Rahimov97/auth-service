import { Module } from '@nestjs/common';
import { SecretInfoController } from './secret-info.controller';

@Module({
  controllers: [SecretInfoController],
})
export class SecretInfoModule {}
