# 后端开发流程

本文按当前仓库的 NestJS + Fastify + MikroORM + PostgreSQL 实现编写。CLI 命令使用项目本地安装的版本，不需要全局安装。

## 1. 准备环境并启动

```bash
pnpm install
cp .env.example .env
```

在 `.env` 中填写 PostgreSQL 连接信息和 `JWT_SECRET`，并先创建 `MIKRO_ORM_DB_NAME` 对应的数据库。`.env` 已被 Git 忽略，不要提交真实密码或密钥。

```bash
pnpm run orm:up
pnpm run start:dev
```

应用使用 Fastify，Swagger 页面由 `src/main.ts` 挂载在 `/api`。默认端口是 `3000`，也可以通过 `PORT` 修改。

## 2. 新增业务模块

先确定资源名、接口路由、请求/响应字段和访问权限，再用 Nest CLI 生成模块骨架。以下以 `articles` 为例：

```bash
pnpm exec nest g module articles
pnpm exec nest g service articles --no-spec
pnpm exec nest g controller articles --no-spec
```

Nest CLI 的 `g` 是 `generate` 的别名，`--no-spec` 用于不生成当前仓库尚无测试运行环境支持的 spec 文件。生成后检查模块是否已自动注册；若没有，在对应模块的 `imports`、`controllers`、`providers` 中补齐。

按当前 `todos` 模块的组织方式补充资源文件：

```text
src/articles/
  dto/
    create-article.dto.ts
    update-article.dto.ts
  entities/
    article.entity.ts
  articles.controller.ts
  articles.module.ts
  articles.service.ts
```

职责保持清晰：

- DTO 描述输入并使用 `class-validator` 装饰器校验。全局 `ValidationPipe` 已开启 `transform`、`whitelist` 和 `forbidNonWhitelisted`。
- Entity 描述数据库映射。更新 DTO 可参考 `UpdateTodoDto`，使用 `PartialType`。
- Module 通过 `MikroOrmModule.forFeature([Article])` 注册实体仓储，并声明 Controller 和 Service。
- Service 处理业务逻辑和持久化，参考 `TodosService` 中的 Repository、`EntityManager` 和 `flush()` 用法。
- Controller 负责 HTTP 路由、参数绑定和调用 Service，不把业务规则堆在控制器里。

确认新模块已由 `AppModule` 导入。需要公开访问的接口用现有 `@Public()` 标记；认证 Guard 默认保护其余接口。新增接口也要检查全局限流策略，并补充 Swagger 的请求/响应说明。

## 3. 修改数据库结构

先修改 Entity，再让 MikroORM CLI 根据实体差异生成迁移：

```bash
pnpm exec mikro-orm migration:create --name=add_article_table
```

检查 `src/migrations/` 中生成的迁移文件及其回滚 SQL，确认没有意外删表或丢失数据，然后应用迁移：

```bash
pnpm exec mikro-orm migration:pending
pnpm run orm:up
```

迁移文件要和对应业务代码一起提交。共享环境和生产环境只执行经过审查的迁移；不要用自动 schema 同步代替版本化迁移。

## 4. 准备种子数据

项目已有 `src/seeders/DatabaseSeeder.ts` 以及 Todo、User 工厂，可按现有模式扩展。需要新 Seeder 时使用 MikroORM CLI：

```bash
pnpm exec mikro-orm seeder:create ArticleSeeder
```

`pnpm run seeder:run` 执行默认 `DatabaseSeeder`。新增 Seeder 后要确认默认 Seeder 如何调用它；仅创建 Seeder 文件不会自动将其加入默认执行流程。

`pnpm run orm:fresh` 会清空数据库并重放迁移、执行默认 Seeder。运行前确认 `.env` 指向可被清空的本地开发数据库，绝不要对共享库或生产库运行。

## 5. 验证改动

```bash
pnpm run build
pnpm run start:dev
```

通过 Swagger 页面和实际请求检查成功、校验失败、未登录、资源不存在等路径。涉及数据库结构的改动，还要在本地空库验证迁移能完整执行。

当前仓库没有 `test`、`test:e2e` 等 package scripts，也没有现成 spec 文件或测试运行器配置。开始依赖自动化测试前，先补齐测试运行器、脚本和最小测试配置，再为 Service 编写单元测试、为 HTTP 流程编写端到端测试。

构建通过后，部署时注入目标环境的数据库配置和 JWT 密钥，并在应用启动前执行待处理迁移。

## CLI 速查

Nest CLI：

```bash
pnpm exec nest g module <name>
pnpm exec nest g service <name> --no-spec
pnpm exec nest g controller <name> --no-spec
pnpm run build
```

MikroORM CLI：

```bash
pnpm exec mikro-orm debug
pnpm exec mikro-orm migration:create --name=<migration_name>
pnpm exec mikro-orm migration:pending
pnpm run orm:up
pnpm exec mikro-orm seeder:create <SeederName>
pnpm run seeder:run
```

官方文档：

- [Nest CLI](https://docs.nestjs.com/cli/usages)
- [Nest 请求校验](https://docs.nestjs.com/techniques/validation)
- [MikroORM 迁移](https://mikro-orm.io/docs/migrations)
- [MikroORM 数据填充](https://mikro-orm.io/docs/seeding)
