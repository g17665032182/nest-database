import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersModule } from './users/users.module';
import mikroOrmConfig from '../mikro-orm.config';
import { LoggerModule } from 'nestjs-pino';
import { PinoHttpConfig } from './common/configs/pino';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { rateLimitConfigs } from './common/configs/rate-limit';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    TodosModule,
    MikroOrmModule.forRoot(mikroOrmConfig),
    UsersModule,
    LoggerModule.forRoot(PinoHttpConfig),
    AuthModule,
    ThrottlerModule.forRoot(rateLimitConfigs),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
