import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required and not set.');
  }

  const app = await NestFactory.create(AppModule);

  const corsOrigins = (
    process.env.CORS_ORIGIN || 'https://catering-pos-brown.vercel.app'
  )
    .split(',')
    .map((o) => o.trim());

  // Always allow localhost ports 3000 and 3001 in development
  // (Next.js falls back to 3001 if 3000 is occupied)
  ['http://localhost:3000', 'http://localhost:3001'].forEach((origin) => {
    if (!corsOrigins.includes(origin)) corsOrigins.push(origin);
  });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Serve uploads statically
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
