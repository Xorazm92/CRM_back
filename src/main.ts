import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configBuilder = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('Learning Management System API documentation')
    .setVersion('1.0')
    .addBearerAuth();

  // Only add tags that have at least one endpoint implemented
  configBuilder
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('admin', 'Admin operations')
    .addTag('teachers', 'Teacher management')
    .addTag('students', 'Student management')
    .addTag('courses', 'Course management')
    .addTag('groups', 'Group management')
    .addTag('lessons', 'Lesson management')
    .addTag('assignments', 'Assignment management')
    .addTag('attendance', 'Attendance tracking')
    .addTag('payments', 'Payment management')
    .addTag('files', 'File management');

  const config = configBuilder.build();

  const document = SwaggerModule.createDocument(app, config);
  // Remove empty tags from Swagger UI
  if (document.tags) {
    document.tags = document.tags.filter(tag => {
      // If there are any paths with this tag, keep it
      return Object.values(document.paths).some((path: any) => {
        return Object.values(path).some((op: any) => op.tags && op.tags.includes(tag.name));
      });
    });
  }
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();