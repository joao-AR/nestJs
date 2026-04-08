import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { applyGlobalConfig } from './global-config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const config = new DocumentBuilder()
    .setTitle('Nest default template')
    .setDescription(
      'Nest template Rest API, Typescript, DDD, Clean architecture',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      description: 'Supply JWT to authorize',
      name: 'Authorization',
      bearerFormat: 'JWT',
      scheme: 'bearer',
      type: 'http',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  applyGlobalConfig(app);
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
