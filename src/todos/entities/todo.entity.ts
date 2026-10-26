import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/decorators/legacy';
import { User } from '../../users/entities/user.entity';

@Entity()
@Index({ properties: ['ownerId'] })
export class Todo {
  // 使用 declare 声明实体字段，避免 TS 直跑时生成运行时 class field。
  @PrimaryKey()
  declare id: number;

  @Property()
  declare title: string;

  @Property({ type: 'text' })
  declare content: string;

  @Property()
  declare isCompleted: boolean;

  // 旧记录保留为空；新建记录由服务端绑定当前用户。
  @ManyToOne(() => User, {
    nullable: true,
    mapToPk: true,
    deleteRule: 'restrict',
    joinColumn: 'owner_id',
  })
  declare ownerId: number | null;
}
