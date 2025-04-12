import { Module } from '@nestjs/common';
import { FileUploadController } from './fileupload.controller';
import { FileUploadService } from './fileupload.service';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
