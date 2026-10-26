import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  EntityManager,
  EntityRepository,
  MikroORM,
} from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Todo } from './entities/todo.entity';
import { FilterTodoDto } from './dto/filter-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    // private readonly orm: MikroORM,

    // 方法一，使用EntityManager，但是需要在使用时 带上实体类如：em.findOne(Todo,123)
    private readonly em: EntityManager,
    //
    // 方法二：在todo的module里导入Repository，然后如下注入
    @InjectRepository(Todo)
    private readonly TodoRepository: EntityRepository<Todo>,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    const todo = this.TodoRepository.create(createTodoDto);
    await this.em.flush();
    return todo;
  }

  async findAll(filterTodoDto: FilterTodoDto) {
    const { page = 1, limit = 5, orderBy = 'asc' } = filterTodoDto;
    const offset = (page - 1) * limit;
    return await this.TodoRepository.findAll({
      limit,
      offset,
      orderBy: { id: orderBy },
    });
  }

  async findOne(id: number) {
    const todo = await this.TodoRepository.findOne(id);
    if (!todo) {
      throw new NotFoundException();
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    this.em.assign(todo, updateTodoDto);
    await this.em.flush();
    return todo;
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    await this.em.remove(todo).flush();
    return todo;
  }
}
