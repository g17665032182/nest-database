import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TodoLogAction } from '../entities/todo-log-action.enum';

export class TodoHistoryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;

  @IsEnum(TodoLogAction)
  @IsOptional()
  action?: TodoLogAction;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  todoId?: number;
}
