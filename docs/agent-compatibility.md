# Agent 兼容性

本仓库以根目录 `AGENTS.md` 作为唯一权威的 Agent 规则文件；`CLAUDE.md` 通过 `@AGENTS.md` 导入同一份规则。具体工具的版本、启动方式或项目配置可能影响指令发现，开始任务时应确认 Agent 实际加载了这些文件。

| Agent            | 指令入口                     | 注意事项                                                                                    |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| Codex            | `AGENTS.md`                  | 从项目根目录读取仓库指令                                                                    |
| Pi               | `AGENTS.md`                  | Pi 会加载当前目录及父目录中的指令文件                                                       |
| DeepSeek Harness | `AGENTS.md`                  | Harness 配置需要启用 agent instructions；`dsh-base` 默认集成该能力，但其他 profile 可能禁用 |
| Claude Code      | `CLAUDE.md` 导入 `AGENTS.md` | 新版本也支持直接读取 `AGENTS.md`；保留导入文件可兼容只读取 `CLAUDE.md` 的会话或配置         |

## 严格执行边界

指令文件用于让 Agent 在开始任务时获得规则，但不能替代自动化验证。项目应继续通过测试、构建、类型检查和迁移审查来把关。涉及字段约束的确认、生产迁移和任何可能清库的操作仍需遵循通用流程中的确认要求。

在 Claude Code 中，可用 `/memory` 检查当前项目指令；其他 Agent 应使用其提供的指令/上下文查看方式核验。DeepSeek Harness 若没有挂载指令加载插件，则不能假定它会读取仓库规则。

## 跨项目复用

将以下文件作为一个版本化单元复制到目标仓库，或通过团队维护的共享仓库分发：

- `AGENTS.md`
- `CLAUDE.md`
- `docs/backend-development-workflow.md`
- `docs/nest-mikroorm-postgres.md`
- `docs/agent-compatibility.md`

如果目标项目采用其他技术栈，保留通用流程并按实际依赖版本查询官方文档；不要只复制默认技术栈命令。分发时使用固定版本或提交号，避免不同项目无意间使用不同的流程版本。

## 官方说明

- [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Pi 项目指令](https://pi.dev/docs/latest/configuration)
- [DeepSeek Harness Agent Instructions](https://github.com/deepseek-ai/deepseek-harness/tree/master/packages/context/agent-instructions)
- [Claude Code 项目记忆与 AGENTS.md](https://code.claude.com/docs/en/memory)
