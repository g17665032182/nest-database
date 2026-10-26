# NestJS + MikroORM + PostgreSQL

这是本模板唯一默认技术栈约定。当前仓库基于 NestJS 11、MikroORM 7、PostgreSQL 和 pnpm；HTTP 适配器使用 Fastify。开始工作前仍要读目标项目的 `package.json`、锁文件和 ORM 配置，以实际安装版本为准。

## 空项目初始化

包管理器优先沿用项目锁文件。没有项目配置且用户没有指定时，本模板默认 pnpm。Nest CLI 的 `new` 命令可选择包管理器；如果目标目录非空，先用 CLI dry-run 确认不会覆盖文件。

```bash
pnpm dlx @nestjs/cli new <project-name> --package-manager pnpm
cd <project-name>
```

Nest 应用生成后，安装 MikroORM 的 PostgreSQL/Nest 集成、迁移、元数据、Seeder、DTO 校验依赖。版本应依据当前 NestJS 版本及 MikroORM 官方兼容文档选择；同一项目中的 MikroORM 包保持兼容版本，不要随意混用不同主版本。

```bash
pnpm add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql @mikro-orm/migrations @mikro-orm/reflection @mikro-orm/seeder @mikro-orm/decorators class-validator class-transformer
pnpm add -D @mikro-orm/cli
```

如需与本仓库保持相同的 HTTP 适配器，再按 NestJS 官方 Fastify 文档安装并配置 `@nestjs/platform-fastify`；不要因为数据库栈相同就假设 Express/Fastify 已经相同。Swagger、JWT、限流、Helmet、Pino 等依赖按项目需求添加，不作为每个 CRUD 模块的重复安装项。

新增环境配置时同时维护 `.env.example`，本地密钥只写入被忽略的 `.env`。ORM CLI 配置也必须加载环境变量，使应用和迁移命令使用一致的数据库连接。创建数据库本身由开发环境提供或按用户授权执行，迁移命令不会替代 PostgreSQL 服务和数据库的准备。

## 既有同栈项目

直接使用项目已安装的 CLI 和依赖。当前仓库的主要命令如下：

```bash
pnpm exec nest g module <resource>
pnpm exec nest g service <resource>
pnpm exec nest g controller <resource>
pnpm exec mikro-orm migration:create --name=<migration_name>
pnpm exec mikro-orm migration:pending
pnpm run orm:up
pnpm run build
```

新资源按项目模式组织：

```text
src/<resource>/
  dto/
  entities/
  <resource>.controller.ts
  <resource>.module.ts
  <resource>.service.ts
```

- DTO 使用 `class-validator` 声明请求约束；全局 `ValidationPipe` 已配置时优先复用。
- Entity 使用当前项目的 MikroORM decorator/metadata 写法，不混用旧版或其他 ORM 的模型。
- Module 用 `MikroOrmModule.forFeature([Entity])` 注册实体仓储。
- Service 负责领域规则和 `EntityManager`/Repository 持久化；Controller 只处理 HTTP。
- Schema 变更先生成并审查 `src/migrations/` 的 up/down SQL，再执行迁移。
- Auth Guard、`@Public()` 等复用当前认证模块；资源级 Guard、Decorator、Pipe 按通用流程中的条件创建。

Seeder 可参考 `src/seeders/`。新增具名 Seeder 后确认默认 `DatabaseSeeder` 是否会调用它。

`pnpm run orm:fresh` 会清空并重建数据库后运行 Seeder，仅限已确认可销毁的本地库，禁止作为常规迁移或部署命令。

## 技术栈不一致时

如果目标项目并非 NestJS + MikroORM + PostgreSQL：

1. 先从锁文件和 `package.json` 确认实际框架、ORM、数据库和精确版本。
2. 查阅这些实际版本的官方安装、集成、CLI、验证和迁移文档。
3. 保留目标项目既有技术栈，按官方 API 调整 CRUD 流程；不要擅自把项目转换成默认栈。
4. 如果官方文档、当前项目配置和用户要求冲突，先报告冲突与影响，再继续。

## 官方文档

- [Nest CLI 使用](https://docs.nestjs.com/cli/usages)
- [Nest 请求校验](https://docs.nestjs.com/techniques/validation)
- [Nest Fastify 适配](https://docs.nestjs.com/techniques/performance)
- [MikroORM + NestJS](https://mikro-orm.io/docs/usage-with-nestjs)
- [MikroORM 迁移](https://mikro-orm.io/docs/migrations)
- [MikroORM 数据填充](https://mikro-orm.io/docs/seeding)
