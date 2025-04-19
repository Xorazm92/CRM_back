import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // Frontend manzili
    credentials: true, // Agar cookie yoki auth header kerak bo'lsa
  });
  app.setGlobalPrefix('api/v1'); // Barcha endpointlar uchun global prefix

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('CRM system API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(3000);
}
bootstrap();