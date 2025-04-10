
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(private prisma: PrismaService) {}

  private readonly UPLOAD_DIR = 'uploads';
  private readonly ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.png'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  async uploadFile(file: Express.Multer.File, userId: string) {
    this.validateFile(file);
    
    const fileName = this.generateUniqueFileName(file.originalname);
    const filePath = path.join(this.UPLOAD_DIR, fileName);
    
    await this.ensureUploadDirectory();
    await fs.promises.writeFile(filePath, file.buffer);

    return {
      originalName: file.originalname,
      fileName: fileName,
      path: filePath,
      size: file.size,
      mimeType: file.mimetype
    };
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds limit');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException('File type not allowed');
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    return `${timestamp}${ext}`;
  }

  private async ensureUploadDirectory() {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      await fs.promises.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }
}
