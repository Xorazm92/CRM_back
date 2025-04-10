
import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileuploadService } from './fileupload.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('File Upload')
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileuploadController {
  constructor(private readonly fileuploadService: FileuploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileuploadService.uploadFile(file);
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Get file' })
  getFile(@Param('filename') filename: string) {
    return this.fileuploadService.getFile(filename);
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete file' })
  deleteFile(@Param('filename') filename: string) {
    return this.fileuploadService.deleteFile(filename);
  }
}
