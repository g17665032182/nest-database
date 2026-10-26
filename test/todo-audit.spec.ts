import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from '../src/todos/dto/create-todo.dto';
import { FilterTodoDto } from '../src/todos/dto/filter-todo.dto';
import { UpdateTodoDto } from '../src/todos/dto/update-todo.dto';
import { TodoLogAction } from '../src/todo-logs/entities/todo-log-action.enum';
import { TodoLogsService } from '../src/todo-logs/todo-logs.service';
import { TodoHistoryQueryDto } from '../src/todo-logs/dto/todo-history-query.dto';
import { TodosService } from '../src/todos/todos.service';

type TodoRecord = {
  id: number;
  title: string;
  content: string;
  isCompleted: boolean;
  ownerId: number | null;
};

function createTodosFixture(todo?: TodoRecord) {
  const calls: string[] = [];
  const records: Array<Record<string, unknown>> = [];
  const repositoryCalls: unknown[][] = [];
  const removed: TodoRecord[] = [];

  const tx = {
    create: (_entity: unknown, data: Record<string, unknown>) => ({
      id: 41,
      ...data,
    }),
    getReference: (_entity: unknown, id: number) => ({ id }),
    persist: () => undefined,
    flush: async () => {
      calls.push('flush');
    },
    findOne: async (
      _entity: unknown,
      where: { id: number; ownerId: number },
    ) =>
      todo?.id === where.id && todo.ownerId === where.ownerId ? todo : null,
    assign: (entity: TodoRecord, data: Partial<TodoRecord>) =>
      Object.assign(entity, data),
    remove: (entity: TodoRecord) => {
      calls.push('remove');
      removed.push(entity);
    },
  };

  const entityManager = {
    transactional: async <T>(callback: (manager: typeof tx) => Promise<T>) =>
      callback(tx),
  };

  const repository = {
    find: async (...args: unknown[]) => {
      repositoryCalls.push(args);
      return [];
    },
    findOne: async (...args: unknown[]) => {
      repositoryCalls.push(args);
      return todo ?? null;
    },
  };

  const todoLogsService = {
    record: (_manager: unknown, input: Record<string, unknown>) => {
      calls.push('record');
      records.push(input);
    },
  };

  return {
    service: new TodosService(
      entityManager as never,
      repository as never,
      todoLogsService as never,
    ),
    calls,
    records,
    repositoryCalls,
    removed,
  };
}

test('creates TODOs for the authenticated owner and records the event atomically', async () => {
  const fixture = createTodosFixture();
  const dto = {
    title: 'First task',
    content: 'Task body',
    isCompleted: false,
  } as CreateTodoDto;

  const todo = await fixture.service.create(dto, 9);

  assert.equal(todo.ownerId, 9);
  assert.deepEqual(fixture.calls, ['flush', 'record', 'flush']);
  assert.deepEqual(fixture.records[0], {
    actorId: 9,
    todoId: 41,
    action: TodoLogAction.CREATED,
    changedFields: ['title', 'content', 'isCompleted'],
  });
});

test('lists and loads TODOs only within the authenticated owner scope', async () => {
  const todo: TodoRecord = {
    id: 41,
    title: 'Owned task',
    content: 'Task body',
    isCompleted: false,
    ownerId: 9,
  };
  const fixture = createTodosFixture(todo);

  await fixture.service.findAll({} as FilterTodoDto, 9);
  await fixture.service.findOne(41, 9);

  assert.deepEqual(fixture.repositoryCalls[0][0], { ownerId: 9 });
  assert.deepEqual(fixture.repositoryCalls[1][0], { id: 41, ownerId: 9 });
});

test('updates only changed fields and records completion transitions', async () => {
  const todo: TodoRecord = {
    id: 41,
    title: 'Owned task',
    content: 'Task body',
    isCompleted: false,
    ownerId: 9,
  };
  const fixture = createTodosFixture(todo);

  await fixture.service.update(41, { isCompleted: true } as UpdateTodoDto, 9);

  assert.equal(todo.isCompleted, true);
  assert.deepEqual(fixture.records[0], {
    actorId: 9,
    todoId: 41,
    action: TodoLogAction.COMPLETED,
    changedFields: ['isCompleted'],
  });
});

test('does not log or mutate a TODO owned by another user', async () => {
  const todo: TodoRecord = {
    id: 41,
    title: 'Private task',
    content: 'Task body',
    isCompleted: false,
    ownerId: 9,
  };
  const fixture = createTodosFixture(todo);

  await assert.rejects(fixture.service.remove(41, 10), NotFoundException);

  assert.equal(fixture.records.length, 0);
  assert.equal(fixture.removed.length, 0);
});

test('keeps a delete event after removing its TODO', async () => {
  const todo: TodoRecord = {
    id: 41,
    title: 'Owned task',
    content: 'Task body',
    isCompleted: false,
    ownerId: 9,
  };
  const fixture = createTodosFixture(todo);

  await fixture.service.remove(41, 9);

  assert.equal(fixture.records[0].action, TodoLogAction.DELETED);
  assert.equal(fixture.records[0].todoId, 41);
  assert.deepEqual(fixture.calls, ['record', 'remove', 'flush']);
});

test('returns only the current user history with filters and descending pagination', async () => {
  let query: unknown;
  let options: unknown;
  const logsRepository = {
    findAndCount: async (where: unknown, findOptions: unknown) => {
      query = where;
      options = findOptions;
      return [
        [
          {
            id: 3,
            todoId: 41,
            actor: { id: 9 },
            action: TodoLogAction.UPDATED,
            changedFields: ['title'],
            createdAt: new Date('2026-10-26T12:00:00.000Z'),
          },
        ],
        1,
      ] as const;
    },
  };
  const service = new TodoLogsService(logsRepository as never);
  const result = await service.findForUser(9, {
    page: 2,
    limit: 10,
    action: TodoLogAction.UPDATED,
    todoId: 41,
  } as TodoHistoryQueryDto);

  assert.deepEqual(query, {
    actor: 9,
    action: TodoLogAction.UPDATED,
    todoId: 41,
  });
  assert.deepEqual(options, {
    limit: 10,
    offset: 10,
    orderBy: { createdAt: 'DESC', id: 'DESC' },
  });
  assert.equal(result.total, 1);
  assert.equal(result.items[0].actorId, 9);
  assert.deepEqual(result.items[0].changedFields, ['title']);
});
