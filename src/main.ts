import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DbExceptionFilter } from './common/filters/db-exception.filter';
import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet'
async function bootstrap() {
  // Express version
  // const app = await NestFactory.create(AppModule,{Logger:false});
  // Fastify version
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new DbExceptionFilter());
  app.useLogger(app.get(Logger));
  const config = new DocumentBuilder()
    .setTitle('Todo example')
    .setDescription('The todo API description')
    .setVersion('1.0')
    .addTag('todos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // 安全防护
  await app.register(helmet)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
