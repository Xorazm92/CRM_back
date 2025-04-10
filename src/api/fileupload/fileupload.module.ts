
import { Module } from '@nestjs/common';
import { FileuploadController } from './fileupload.controller';
import { FileuploadService } from './fileupload.service';

@Module({
  controllers: [FileuploadController],
  providers: [FileuploadService],
})
export class FileuploadModule {}
