# Nest Database

一个用于后端项目起步的 NestJS 模板，当前使用 NestJS 11、Fastify、PostgreSQL 和 MikroORM。

## 本地启动

```bash
pnpm install
cp .env.example .env
```

先在 PostgreSQL 中创建 `.env` 配置的数据库，再初始化表结构并启动：

```bash
pnpm run orm:up
pnpm run start:dev
```

Swagger 文档地址为 `http://localhost:3000/api`。如需更换端口，在 `.env` 中设置 `PORT`。

## 开发流程

本项目的 Agent 工作入口是 [AGENTS.md](AGENTS.md)。跨项目通用流程见[后端开发流程](docs/backend-development-workflow.md)，NestJS + MikroORM + PostgreSQL 初始化和 CRUD 细节见[技术栈约定](docs/nest-mikroorm-postgres.md)，不同 Agent 的读取方式见[Agent 兼容性说明](docs/agent-compatibility.md)。

流程支持两种主要场景：空项目初始化时使用选定的包管理器创建 NestJS 项目并安装数据库依赖；已使用默认技术栈时先确认业务字段和约束，再实现 CRUD。技术栈不同时，Agent 必须先按实际依赖版本查阅对应官方文档并保留现有技术选型。

每个 CRUD 任务都应从 [契约模板](docs/templates/crud-contract.md) 创建并保留 `docs/contracts/<资源名>-crud-contract.md`，作为用户确认、实现和验收的共同记录。跨项目复用时，需要一并提供 `AGENTS.md`、`CLAUDE.md` 和 `docs/` 下的流程文件及模板。只复制入口文件不足以提供完整流程。

## 常用命令

| 用途            | 命令                                                           |
| --------------- | -------------------------------------------------------------- |
| 开发模式        | `pnpm run start:dev`                                           |
| 构建            | `pnpm run build`                                               |
| 生产模式        | `pnpm run start:prod`                                          |
| 创建数据库迁移  | `pnpm exec mikro-orm migration:create --name=<migration_name>` |
| 执行待处理迁移  | `pnpm run orm:up`                                              |
| 运行默认 Seeder | `pnpm run seeder:run`                                          |

`pnpm run orm:fresh` 会清空并重建数据库结构，然后运行默认 Seeder；仅限确认过目标库的本地开发环境使用。

`pnpm run seeder:create` 固定生成 `DatabaseSeeder`，通常仅在初始化模板时使用。新增具名 Seeder 请运行 `pnpm exec mikro-orm seeder:create <SeederName>`。

## 当前模板边界

仓库尚未配置测试运行器和 `test` 脚本。新增功能前请按开发流程文档补齐测试配置，不要直接依赖 Nest 默认 README 中的测试命令。
