import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TodoLogsService } from './todo-logs.service';
import { TodoLogsController } from './todo-logs.controller';
import { TodoLog } from './entities/todo-log.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TodoLog])],
  providers: [TodoLogsService],
  controllers: [TodoLogsController],
  exports: [TodoLogsService],
})
export class TodoLogsModule {}
