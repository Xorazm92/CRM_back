import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './fileupload.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    user_id: string;
  };
}

@ApiTags('File Upload')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileuploadService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    const userId = req.user.user_id;
    return this.fileuploadService.uploadFile(file, userId);
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