import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
@Entity()
export class User {
  @PrimaryKey()
  id: number;
  @Property({
    unique: true,
  })
  email: string;
  @Property()
  password: string;
}
