import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './fileupload.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
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

  @Get(':filename')
  @ApiOperation({ summary: 'Get file' })
  async getFile(@Param('filename') filename: string) {
    try {
      return await this.fileuploadService.getFile(filename);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete file' })
  async deleteFile(@Param('filename') filename: string) {
    try {
      return await this.fileuploadService.deleteFile(filename);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }
}