import { Module } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacModule as CommonRbacModule } from '../../common/rbac/rbac.module';

@Module({
  imports: [CommonRbacModule],
  controllers: [RbacController],
})
export class RbacApiModule {}
