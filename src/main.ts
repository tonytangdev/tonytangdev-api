import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule.forRoot());

  // API versioning
  app.setGlobalPrefix('api/v1');

  // CORS for public API
  app.enableCors({
    origin: true,
    credentials: false,
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Tony Tang Developer Portfolio API')
    .setDescription(
      'RESTful API for developer portfolio showcasing skills, experiences, projects, and refactorings',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs-json', app, document);

  // Scalar UI at /api/docs
  app.use('/api/docs', (req, res) => {
    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Tony Tang API Documentation</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <script
            id="api-reference"
            data-url="/api/docs-json-json"
            data-configuration='${JSON.stringify({
              theme: 'elysiajs',
            })}'
          ></script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>
    `);
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
