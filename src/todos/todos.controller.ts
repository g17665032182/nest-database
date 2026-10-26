import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FilterTodoDto } from './dto/filter-todo.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  @Throttle({ default: { ttl: 1000, limit: 5 } })
  findAll(@Query() filterTodoDto: FilterTodoDto) {
    return this.todosService.findAll(filterTodoDto);
  }

  @Get(':id')
  @SkipThrottle()
  findOne(@Param('id') id: number) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.todosService.remove(id);
  }
}
