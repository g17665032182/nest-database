import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { User } from '../../users/entities/user.entity';
import { TodoLogAction } from './todo-log-action.enum';

@Entity()
@Index({ properties: ['actor', 'createdAt'] })
@Index({ properties: ['actor', 'todoId', 'createdAt'] })
export class TodoLog {
  @PrimaryKey()
  declare id: number;

  // 不建立 TODO 外键，确保 TODO 物理删除后历史记录仍可查询。
  @Property()
  declare todoId: number;

  @ManyToOne(() => User, { deleteRule: 'restrict' })
  declare actor: User;

  @Enum({ items: () => TodoLogAction })
  declare action: TodoLogAction;

  @Property({ type: 'jsonb' })
  declare changedFields: string[];

  @Property({ type: 'timestamptz' })
  declare createdAt: Date;
}
