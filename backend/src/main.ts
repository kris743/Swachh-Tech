import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use((req: any, res: any, next: any) => {
    console.log(`\n[INCOMING REQUEST] ${req.method} ${req.url}`);
    console.log(`[HEADERS] Authorization: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
    
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.decode(token, { complete: true });
        console.log('[JWT DECODED HEADER]', decoded?.header);
        console.log('[JWT DECODED PAYLOAD]', decoded?.payload);
        
        // Try verifying with raw string
        const secretString = process.env.SUPABASE_JWT_SECRET;
        try {
          jwt.verify(token, secretString);
          console.log('[JWT VERIFY] Success with raw string!');
        } catch (e: any) {
          console.log('[JWT VERIFY STRING ERROR]', e.message);
        }
        
        try {
          const secretBuf = Buffer.from(secretString, 'base64');
          jwt.verify(token, secretBuf);
          console.log('[JWT VERIFY] Success with base64 buffer!');
        } catch (e: any) {
          console.log('[JWT VERIFY BUFFER ERROR]', e.message);
        }
        
      } catch (e) {
        console.log('[JWT PARSE ERROR]', e);
      }
    }

    if (req.method === 'OPTIONS') {
      console.log(`[OPTIONS] Origin: ${req.headers.origin}`);
    }
    next();
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Increase payload limit for base64 image uploads
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors and Filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SWACHH TECH AI API')
    .setDescription('Smart Waste Management SaaS API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
