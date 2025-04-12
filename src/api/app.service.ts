import { NestFactory } from '@nestjs/core';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLogger } from '../infrastructure/lib/custom-logger/logger.service';
// import { AllExceptionsFilter } from '../infrastructure';
// import { config } from '../config';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

export default class Application {
  public static async main(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const logger = app.get(CustomLogger);
    // app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    const api = 'api/v1';
    const swaggerApi = 'api/docs';
    app.setGlobalPrefix(api);
    const config_swagger = new DocumentBuilder()
      .setTitle('LMS')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        in: 'Header',
      })
      .build();
    const documentFactory = () =>
      SwaggerModule.createDocument(app, config_swagger);
    SwaggerModule.setup(swaggerApi, app, documentFactory);
    const server_port = process.env.API_PORT ?? 3000;
    await app.listen(server_port, () => {
      logger.log(`Server: http://localhost:${server_port}/api/v1/`);
    });
  }
}