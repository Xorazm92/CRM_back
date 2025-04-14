import { Module } from '@nestjs/common';
import { FileUploadController } from './fileupload.controller';
import { FileUploadService } from './fileupload.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CustomJwtModule } from 'src/infrastructure/lib/custom-jwt';

@Module({
  imports: [PrismaModule, CustomJwtModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
