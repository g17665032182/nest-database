import { Migration } from '@mikro-orm/migrations';

export class Migration20260731085245 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(255) not null, "password" varchar(255) not null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }

}
