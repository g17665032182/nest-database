import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy'
@Entity()
export class Todo {
  // 使用 declare 声明实体字段，避免 TS 直跑时生成运行时 class field。
  @PrimaryKey()
  declare id:number
  @Property()
  declare title:string
  @Property({ type:"text" })
  declare content:string
  @Property()
  declare isCompleted:boolean
}
