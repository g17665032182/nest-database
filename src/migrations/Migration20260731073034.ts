import { Migration } from '@mikro-orm/migrations';

export class Migration20260731073034 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "todo" alter column "content" type text using ("content"::text);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "todo" alter column "content" type varchar(255) using ("content"::varchar(255));`);
  }

}
