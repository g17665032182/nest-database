import { Migration } from '@mikro-orm/migrations';

export class Migration20261026135336_todo_audit extends Migration {
  // 中文注释：为 TODO 添加用户归属，并创建可独立保留的操作日志表。
  override up(): void | Promise<void> {
    this.addSql(
      `create table "todo_log" ("id" serial primary key, "todo_id" int not null, "actor_id" int not null, "action" text not null, "changed_fields" jsonb not null, "created_at" timestamptz not null);`,
    );
    this.addSql(
      `create index "todo_log_actor_id_todo_id_created_at_index" on "todo_log" ("actor_id", "todo_id", "created_at");`,
    );
    this.addSql(
      `create index "todo_log_actor_id_created_at_index" on "todo_log" ("actor_id", "created_at");`,
    );

    this.addSql(
      `alter table "todo_log" add constraint "todo_log_actor_id_foreign" foreign key ("actor_id") references "user" ("id") on delete restrict;`,
    );
    this.addSql(
      `alter table "todo_log" add constraint "todo_log_action_check" check ("action" in ('created', 'updated', 'completed', 'reopened', 'deleted'));`,
    );

    this.addSql(`alter table "todo" add "owner_id" int null;`);
    this.addSql(
      `alter table "todo" add constraint "todo_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on delete restrict;`,
    );
    this.addSql(`create index "todo_owner_id_index" on "todo" ("owner_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "todo_log" cascade;`);

    this.addSql(`alter table "todo" drop constraint "todo_owner_id_foreign";`);

    this.addSql(`drop index "todo_owner_id_index";`);
    this.addSql(`alter table "todo" drop column "owner_id";`);
  }
}
