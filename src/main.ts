/*
 * @Date: 2026-07-30 10:15:24
 * @LastEditors: shiyu 625991037@qq.com
 * @LastEditTime: 2026-10-26 17:15:36
 * @FilePath: /nest-database/src/main.ts
 * @Description: 应用程序入口文件
 */
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
      //  中文注释：开启请求参数验证，自动将请求参数转换为 DTO 实例。
      transform: true,
      // 中文注释：开启请求参数验证，自动将请求参数转换为 DTO 实例。
      whitelist: true,
      //  中文注释：开启白名单模式，自动剔除 DTO 中未定义的属性，防止多余参数被传入。
      forbidNonWhitelisted: true,
      transformOptions: {
        // 中文注释：开启隐式类型转换，允许将请求参数自动转换为 DTO 中定义的类型。
        enableImplicitConversion: true,
      },
    }),
  );
  // 中文注释：注册全局异常过滤器，捕获数据库异常并统一处理。
  app.useGlobalFilters(new DbExceptionFilter());
  // 中文注释：注册全局日志记录器，使用 Pino 进行日志记录。
  app.useLogger(app.get(Logger));
  // 中文注释：配置 Swagger 文档生成器，提供 API 文档和测试界面。
  const config = new DocumentBuilder()
  // 中文注释：设置 Swagger 文档的标题、描述、版本和标签信息。
    .setTitle('Todo example')
    // 中文注释：设置 Swagger 文档的标题、描述、版本和标签信息。
    .setDescription('The todo API description')
    // 中文注释：设置 Swagger 文档的标题、描述、版本和标签信息。
    .setVersion('1.0')
    //  中文注释：设置 Swagger 文档的标题、描述、版本和标签信息。
    .addTag('todos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // 中文注释：设置 Swagger 文档的访问路径为 /api，提供 API 文档和测试界面。
  SwaggerModule.setup('api', app, document);
  // 安全防护
  await app.register(helmet)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
