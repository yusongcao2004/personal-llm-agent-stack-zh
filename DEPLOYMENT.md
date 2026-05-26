# Deployment Notes

这篇文档记录个人 LLM Agent deployment 的设计形态。它不是 production runbook，也不表示这个仓库包含一个完整可部署系统。

## Deployment Intent

项目关注 local-first personal agent stack。目标是理解 agent tools、model providers、local models、routing decisions 和 user approvals 如何在一个实际环境中配合。

Deployment 重点：

- 让敏感工作可以被用户检查。
- 在本地资源和外部 model providers 之间保持清晰边界。
- 为任务选择足够小、足够便宜的模型。
- 记录那些容易隐藏在临时配置里的决策。
- 把 safety checks 当作 deployment 的一部分，而不是事后补丁。

## Local-First Assumptions

个人部署可能包含 local models、本地工具执行、本地文件，以及可选的 hosted APIs。关键不是所有步骤都必须本地化，而是系统要明确说明哪些步骤是本地的、哪些会调用外部服务。

每个组件都可以问：

- 这一步是否需要外部网络访问？
- 这一步是否会把 private context 暴露给 hosted model？
- 用户是否可以检查或中断这个动作？
- 是否有更便宜或更低风险的模型可以完成任务？
- 如果 tool call、model call 或本地进程失败，会发生什么？

## Environment Boundaries

Deployment 边界应该区分：

- 用户文件和 credentials。
- Local model runtime 和 cache directories。
- Hosted model API keys 和 provider configuration。
- Tool execution permissions。
- Logs、traces 和 temporary artifacts。

对个人 stack 来说，这些边界能让项目表述更诚实，也能避免把实验描述成 unattended production operation。

## Operational Notes

运行姿态应优先选择明确控制，而不是过度自动化：

- 在加入 background automation 前，先从 manual execution 开始。
- 对会修改文件、账号或外部状态的动作，优先使用 dry run。
- Credentials 不进入文档和 source control。
- 实验配置和日常使用配置分开。
- 记录足够 debug failure 的信息，但避免保存不必要的 private content。

## Non-Goals

本仓库不包含 implementation package、hosted service 或 production deployment pipeline。它记录的是个人 Agent deployment 周边的推理、配置和工程实践。
