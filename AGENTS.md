# Agent 工作约定

- 接到后端项目初始化或 CRUD 功能任务时，先阅读 [通用开发流程](docs/backend-development-workflow.md) 和 [NestJS + MikroORM + PostgreSQL 技术栈约定](docs/nest-mikroorm-postgres.md)。
- 本流程的默认技术栈是 NestJS、MikroORM 和 PostgreSQL。本仓库使用 pnpm；其他项目沿用项目已配置的包管理器。
- 先判断项目是空项目、已使用默认技术栈，还是使用其他技术栈。发现技术栈不同时，先检查实际依赖及版本并查阅对应官方文档；不得默默替换项目技术栈或臆造 CLI 命令。
- 实现 CRUD 前整理字段、类型、必填/可空、默认值、唯一/索引、校验和关联约束。约束不明确时，先向用户确认，再创建 Entity、DTO 或数据库迁移。
- 先复用仓库已安装的库、CLI、模块和全局 Guard/Pipe；新增代码保持模块化，新增代码注释使用中文。
- 不得默认执行会清库的数据库命令。完成后报告实际运行过的测试、构建和迁移检查及其结果。
