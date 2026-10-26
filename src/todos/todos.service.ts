import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Todo } from './entities/todo.entity';
import { FilterTodoDto } from './dto/filter-todo.dto';
import { TodoLogsService } from '../todo-logs/todo-logs.service';
import { TodoLogAction } from '../todo-logs/entities/todo-log-action.enum';

@Injectable()
export class TodosService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Todo)
    private readonly todoRepository: EntityRepository<Todo>,
    private readonly todoLogsService: TodoLogsService,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: number) {
    return this.em.transactional(async (tx) => {
      const todo = tx.create(Todo, {
        ...createTodoDto,
        ownerId: userId,
      });
      tx.persist(todo);
      await tx.flush();

      this.todoLogsService.record(tx, {
        actorId: userId,
        todoId: todo.id,
        action: TodoLogAction.CREATED,
        changedFields: Object.keys(createTodoDto),
      });
      await tx.flush();

      return todo;
    });
  }

  async findAll(filterTodoDto: FilterTodoDto, userId: number) {
    const { page = 1, limit = 5, orderBy = 'asc' } = filterTodoDto;
    const offset = (page - 1) * limit;
    return this.todoRepository.find(
      { ownerId: userId },
      {
        limit,
        offset,
        orderBy: { id: orderBy },
      },
    );
  }

  async findOne(id: number, userId: number) {
    const todo = await this.todoRepository.findOne({ id, ownerId: userId });
    if (!todo) {
      throw new NotFoundException();
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto, userId: number) {
    return this.em.transactional(async (tx) => {
      const todo = await tx.findOne(Todo, { id, ownerId: userId });
      if (!todo) {
        throw new NotFoundException();
      }

      const changedFields = Object.entries(updateTodoDto)
        .filter(([field, value]) => todo[field] !== value)
        .map(([field]) => field);

      if (changedFields.length === 0) {
        return todo;
      }

      tx.assign(todo, updateTodoDto);
      const isCompletionChange = changedFields.includes('isCompleted');
      const action = isCompletionChange
        ? updateTodoDto.isCompleted
          ? TodoLogAction.COMPLETED
          : TodoLogAction.REOPENED
        : TodoLogAction.UPDATED;

      this.todoLogsService.record(tx, {
        actorId: userId,
        todoId: todo.id,
        action,
        changedFields,
      });
      await tx.flush();

      return todo;
    });
  }

  async remove(id: number, userId: number) {
    return this.em.transactional(async (tx) => {
      const todo = await tx.findOne(Todo, { id, ownerId: userId });
      if (!todo) {
        throw new NotFoundException();
      }

      this.todoLogsService.record(tx, {
        actorId: userId,
        todoId: todo.id,
        action: TodoLogAction.DELETED,
        changedFields: [],
      });
      tx.remove(todo);
      await tx.flush();

      return todo;
    });
  }
}
