import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { User } from '../users/entities/user.entity';
import { TodoHistoryQueryDto } from './dto/todo-history-query.dto';
import { TodoLogAction } from './entities/todo-log-action.enum';
import { TodoLog } from './entities/todo-log.entity';

export interface CreateTodoLogInput {
  actorId: number;
  todoId: number;
  action: TodoLogAction;
  changedFields: string[];
}

@Injectable()
export class TodoLogsService {
  constructor(
    @InjectRepository(TodoLog)
    private readonly todoLogRepository: EntityRepository<TodoLog>,
  ) {}

  // 使用调用方事务中的 EntityManager，保证任务和日志一起提交或回滚。
  record(em: EntityManager, input: CreateTodoLogInput): void {
    const log = em.create(TodoLog, {
      actor: em.getReference(User, input.actorId),
      todoId: input.todoId,
      action: input.action,
      changedFields: input.changedFields,
      createdAt: new Date(),
    });

    em.persist(log);
  }

  async findForUser(userId: number, query: TodoHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      actor: userId,
      ...(query.action ? { action: query.action } : {}),
      ...(query.todoId ? { todoId: query.todoId } : {}),
    };
    const [logs, total] = await this.todoLogRepository.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { createdAt: 'DESC', id: 'DESC' },
    });

    return {
      items: logs.map((log) => ({
        id: log.id,
        todoId: log.todoId,
        actorId: log.actor.id,
        action: log.action,
        changedFields: log.changedFields,
        createdAt: log.createdAt,
      })),
      total,
      page,
      limit,
    };
  }
}
