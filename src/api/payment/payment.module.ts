import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
// Guard va dekoratorlarni import qilish
import { AdminGuard } from 'src/common/guard/admin.guard';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/guards/roles.guard';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt.module';

@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    AdminGuard,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
