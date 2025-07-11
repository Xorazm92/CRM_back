import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(compression());

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

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

                             
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './api/app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.enableCors({
//     origin: ['https://crm.zufariy.uz', 'http://localhost:3030', 'https://raya>
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//   });
//   app.setGlobalPrefix('api/v1');

//   // Swagger setup
//   const config = new DocumentBuilder()
//     .setTitle('CRM/LMS Universal User API')
//     .setDescription('Professional, scalable, and secure user management API.\>
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document);

//   await app.listen(3030);
// }
// bootstrap();