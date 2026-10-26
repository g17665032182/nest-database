import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { TodoFactory } from './Todofactory';
import { UserFactory } from './Userfactory';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const users = new UserFactory(em).make(10);
    // 自增 ID 在写入后生成，先 flush 再将 ID 传给 TODO 工厂。
    await em.flush();
    // 为演示数据绑定所有者，避免 Seeder 生成的 TODO 被用户隔离规则隐藏。
    users.forEach((owner) =>
      new TodoFactory(em).make(1, { ownerId: owner.id }),
    );
  }
}
