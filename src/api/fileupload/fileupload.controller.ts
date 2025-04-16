import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './fileupload.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

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
    try {
      const userId = req.user.user_id;
      return await this.fileuploadService.uploadFile(file, userId);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all files' })
  @ApiResponse({ status: 200, description: 'List of files', schema: { type: 'array', items: { type: 'object', properties: { filename: { type: 'string' }, size: { type: 'number' }, mimeType: { type: 'string' } } } } })
  async listFiles() {
    return await this.fileuploadService.listFiles();
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Get file' })
  @ApiParam({ name: 'filename', description: 'File name to download' })
  @ApiResponse({ status: 200, description: 'File found', schema: { type: 'string', format: 'binary' } })
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const file = await this.fileuploadService.getFile(filename);
      return res.download(file.path, file.filename);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete file' })
  @ApiParam({ name: 'filename', description: 'File name to delete' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  async deleteFile(@Param('filename') filename: string) {
    try {
      return await this.fileuploadService.deleteFile(filename);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}