
import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription(`
      Learning Management System API documentation.
      This API provides endpoints for managing:
      - Users (Admin, Teachers, Students)
      - Courses and Groups
      - Lessons and Assignments
      - Attendance and Grades
      - File Uploads
    `)
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Development')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('admin', 'Admin management endpoints')
    .addTag('teachers', 'Teacher management endpoints')
    .addTag('students', 'Student management endpoints')
    .addTag('courses', 'Course management endpoints')
    .addTag('groups', 'Group management endpoints')
    .addTag('lessons', 'Lesson management endpoints')
    .addTag('assignments', 'Assignment management endpoints')
    .addTag('attendance', 'Attendance management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
