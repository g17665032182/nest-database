---
name: nestjs-mikroorm-crud
description: 初始化 NestJS、MikroORM、PostgreSQL 后端项目或实现基础 CRUD 模块时使用。若现有项目使用不同技术栈，保留原选型并查阅对应官方文档，不擅自迁移。
---

# NestJS + MikroORM + PostgreSQL 后端与 CRUD

用于初始化空后端项目，或在现有项目中新增基础 CRUD 资源。默认技术栈是 NestJS、MikroORM 和 PostgreSQL；以仓库实际依赖和用户决策为准。

## 开始前检查

1. 阅读 `AGENTS.md`、`CLAUDE.md` 等项目指令，检查 Git 状态、包清单和锁文件、依赖版本、ORM 配置及一个相似模块。保留无关和未提交改动。
2. 先检查项目已安装的库、CLI、现有模块及本地文档。本地方案不能满足需求时，再查找并验证合适的开源库；没有合适方案时才自行实现基础设施。
3. 判断项目是空项目、已使用默认技术栈、部分配置，还是使用其他技术栈。若现有栈不同，保留其框架、ORM 和数据库；使用 API 或命令前查阅与实际安装版本匹配的文档，不得静默迁移项目。
4. 根据锁文件和 `packageManager` 字段沿用项目包管理器，不要创建第二份锁文件。空项目没有任何线索且用户未指定时，使用 pnpm，并在安装前说明。

## 初始化空项目

确认目标目录和项目名称。使用所选包管理器调用 Nest CLI，不覆盖已有文件。pnpm 的常见起点：

```bash
pnpm dlx @nestjs/cli new <project-name> --package-manager pnpm
```

生成骨架后，查阅当前 NestJS 和 MikroORM 文档，确定兼容版本，再添加 PostgreSQL 驱动、Nest 集成、迁移、反射/Decorator 支持和请求校验依赖。默认技术栈的 pnpm 安装通常包括：

```bash
pnpm add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql @mikro-orm/migrations @mikro-orm/reflection @mikro-orm/decorators class-validator class-transformer
pnpm add -D @mikro-orm/cli
```

仅在模板或用户需求需要时添加 Seeder 或 HTTP 适配器。确保 MikroORM 各包版本兼容。应用和迁移 CLI 应使用一致的环境变量配置；不要把密钥写入受 Git 跟踪的文件。新增业务资源前，先构建并运行脚手架已有检查。

## 确认 CRUD 契约

每个资源开始实现前，从[契约模板](references/crud-contract.md)创建 `docs/contracts/<resource>-crud-contract.md`，并将填写完成的契约保留在项目中，供实现和审查共同使用。

记录业务范围、字段名称与类型、创建/更新必填规则、可空性、默认值、唯一/索引范围、校验、关联与删除行为、读写范围、API 路由与响应结构、分页/过滤/排序、认证与资源所有权、错误行为、迁移兼容性和验收项。注明每项决策来源：用户需求、用户确认或具体的项目现有约定。

需求已明确的约束应记录来源并标为已确认，不要要求用户重复说明。若影响数据、授权、兼容性或 API 行为的约束有歧义，将契约标为“待确认”，汇总问题一次性询问，并暂停 CRUD 实现。未得到答复前，不得创建或修改 Entity、DTO、Guard、Decorator、Pipe 或数据库迁移。不得把 Agent 的假设当成已确认的业务规则。

## 实现资源模块

沿用项目已有结构和 CLI。对于现有 Nest 项目，只用已安装的 CLI 生成需要的骨架，例如：

```bash
pnpm exec nest g module <resource>
pnpm exec nest g service <resource>
pnpm exec nest g controller <resource>
```

根据项目包管理器调整命令；不确定 CLI 参数时，先核对已安装版本的文档。

- Entity 只表达持久化结构和数据库约束。
- 为创建、更新、查询请求分别定义 DTO；复用项目验证管道和已安装的校验器。
- 业务规则和持久化逻辑放在 Service；Controller 只处理 HTTP 参数绑定和调用。
- 按项目现有 MikroORM 模式注册 Entity Repository。
- 复用现有认证、公开路由标记、授权、当前用户 Decorator 和输入校验。只有存在明确且可复用的独立需求时才添加 Guard、Decorator 或 Pipe，并在契约中说明原因。
- 保持模块高内聚、低耦合。新增代码注释使用简洁中文。
- Entity 变更要生成并审查迁移，执行前检查 SQL 和兼容性。除非用户明确授权且目标数据库可销毁，否则不得使用会清库的 reset/fresh 命令。

## 验证与汇报

对照已确认的契约检查实现。按需覆盖创建、列表、详情、更新、删除、输入校验、授权、冲突、不存在资源和关联行为。运行仓库现有测试、构建、格式/类型检查和迁移状态检查，并如实报告命令和结果。不得声称未运行的检查已通过。审查最终差异，排除无关改动、密钥和破坏性 SQL。
