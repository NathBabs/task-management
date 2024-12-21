import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const logger = new Logger('bootstrap');
    const app = await NestFactory.create(AppModule);

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Task Management API')
      .setDescription('API documentation for Task Management System')
      .setVersion('1.0')
      .addTag('tasks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Apply global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    const port = process.env.PORT ?? 3000;

    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(
      `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
    );

    // Handle shutdown gracefully
    process.on('SIGTERM', async () => {
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
