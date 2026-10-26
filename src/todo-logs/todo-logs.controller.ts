import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorator/current-user.decorator';
import { TodoHistoryQueryDto } from './dto/todo-history-query.dto';
import { TodoLogsService } from './todo-logs.service';

@Controller('todos')
export class TodoLogsController {
  constructor(private readonly todoLogsService: TodoLogsService) {}

  @Get('history')
  findForUser(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TodoHistoryQueryDto,
  ) {
    return this.todoLogsService.findForUser(user.sub, query);
  }
}
