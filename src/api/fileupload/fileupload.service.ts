import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getFile(filename: string) {
    const filePath = path.join(this.UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    return {
      filename,
      path: filePath
    };
  }

  async deleteFile(filename: string) {
    const filePath = path.join(this.UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    await fs.promises.unlink(filePath);
    return { message: 'File deleted successfully' };
  }

  async listFiles() {
    await this.ensureUploadDirectory();
    const files = await fs.promises.readdir(this.UPLOAD_DIR);
    const fileList = await Promise.all(files.map(async (filename) => {
      const filePath = path.join(this.UPLOAD_DIR, filename);
      const stats = await fs.promises.stat(filePath);
      return {
        filename,
        size: stats.size,
        mimeType: path.extname(filename).replace('.', '')
      };
    }));
    return fileList;
  }

  private validateFile(file: Express.Multer.File) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
    }
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`File size too large. Maximum allowed size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    return `${timestamp}-${random}${extension}`;
  }

  private async ensureUploadDirectory() {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      await fs.promises.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }
}
