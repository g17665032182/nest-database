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
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorator/current-user.decorator';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.todosService.create(createTodoDto, user.sub);
  }

  @Get()
  @Throttle({ default: { ttl: 1000, limit: 5 } })
  findAll(
    @Query() filterTodoDto: FilterTodoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.todosService.findAll(filterTodoDto, user.sub);
  }

  @Get(':id')
  @SkipThrottle()
  findOne(@Param('id') id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.todosService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.todosService.update(id, updateTodoDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.todosService.remove(id, user.sub);
  }
}
