import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Learning Analytics API')
    .setDescription('API documentation for the Learning Analytics ETL system')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [],
  });

  SwaggerModule.setup('api-docs', app, document);
}
