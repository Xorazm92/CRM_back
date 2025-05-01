import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3030'],
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('CRM/LMS Universal User API')
    .setDescription('Professional, scalable, and secure user management API.\n\n**Features:**\n- Universal user model (Student, Teacher, Admin, Manager)\n- Role & status filtering, search\n- Secure password handling\n- Robust validation & error handling\n- Swagger documentation\n\n**Filter Example:**\n`/users/filter?role=TEACHER&status=ACTIVE&search=ali`')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3030);
}
bootstrap();