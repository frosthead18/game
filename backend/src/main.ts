import './sentry.init';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { EntityNotFoundFilter } from '@common/filters/entity-not-found.filter';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:4200',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(
    new EntityNotFoundFilter(),
    app.get(GlobalExceptionFilter),
  );

  const isDev = process.env['NODE_ENV'] !== 'production';
  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Game API')
      .setDescription('Backend API for the multiplayer game platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  app.flushLogs();

  logger.log(`Backend running on http://localhost:${port}`);
  if (isDev) {
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
