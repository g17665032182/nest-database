# Agent 工作约定

- 接到后端项目初始化或 CRUD 功能任务时，先阅读 [通用开发流程](docs/backend-development-workflow.md) 和 [NestJS + MikroORM + PostgreSQL 技术栈约定](docs/nest-mikroorm-postgres.md)。
- 每个 CRUD 任务都要从 [CRUD 契约模板](docs/templates/crud-contract.md) 创建 `docs/contracts/<资源名>-crud-contract.md`，记录需求、字段/API 约束、待确认项和验收方式；实现时保留这份契约记录。
- 本流程的默认技术栈是 NestJS、MikroORM 和 PostgreSQL。本仓库使用 pnpm；其他项目沿用项目已配置的包管理器。
- 先判断项目是空项目、已使用默认技术栈，还是使用其他技术栈。发现技术栈不同时，先检查实际依赖及版本并查阅对应官方文档；不得默默替换项目技术栈或臆造 CLI 命令。
- 开发前先检查项目已安装的库、CLI、现有模块及其文档；本地方案不能满足需求时，再查找并验证合适的开源库，最后才考虑自行实现。
- 实现 CRUD 前填写契约并确认字段、类型、必填/可空、默认值、唯一/索引、校验、关联、权限和删除约束。用户需求已明确的，注明需求来源后继续；关键约束不明确时，先向用户提问并暂停 CRUD 代码实现，在得到答复前不得创建或修改 Entity、DTO、Guard、Decorator、Pipe 或数据库迁移。
- 先复用仓库已安装的库、CLI、模块和全局 Guard/Pipe；新增代码保持模块化，新增代码注释使用中文。
- 不得默认执行会清库的数据库命令。完成后报告实际运行过的测试、构建和迁移检查及其结果。
