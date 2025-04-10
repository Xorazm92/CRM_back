
import { Injectable } from '@nestjs/common';
import { createWriteStream, unlink } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(unlink);

@Injectable()
export class FileuploadService {
  private readonly uploadsDirectory = join(process.cwd(), 'uploads');

  async uploadFile(file: Express.Multer.File) {
    const filename = `${Date.now()}-${file.originalname}`;
    const writeStream = createWriteStream(join(this.uploadsDirectory, filename));
    
    return new Promise((resolve, reject) => {
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on('finish', () => resolve({ filename }));
      writeStream.on('error', reject);
    });
  }

  async getFile(filename: string) {
    return {
      path: join(this.uploadsDirectory, filename),
    };
  }

  async deleteFile(filename: string) {
    await unlinkAsync(join(this.uploadsDirectory, filename));
    return { success: true };
  }
}
