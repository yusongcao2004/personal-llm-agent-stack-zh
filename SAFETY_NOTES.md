# Safety Notes

这篇文档记录个人 LLM Agent deployment 的 safety 和 reliability 考量。它不是正式安全审计，也不是 production safety case。

## Safety Posture

Agentic systems 应该围绕 user control 设计。一个 workflow 越可能影响文件、账号、外部服务或他人，就越需要 review 和 confirmation。

## Human-in-the-Loop Controls

以下情况应使用 human oversight：

- 修改或删除文件。
- 外部通信或账号操作。
- 长时间运行或 recurring tasks。
- 访问敏感目录或 credentials 的 tool calls。
- 模型表达低 confidence 的 workflow。

有用的控制模式：

- 执行前 preview。
- 尽可能提供 dry-run mode。
- 对不可逆步骤要求 explicit approval。
- 清楚总结将要改变什么。
- 使用 logs 帮助用户还原关键动作。

## Permission Boundaries

系统应该区分 reading、writing、executing 和 network access。把所有 tools 当成同一类权限，会让 agent 行为更难检查，也更难信任。

推荐边界：

- 探索阶段只读访问。
- 对文档或已批准编辑提供窄范围写权限。
- 对会改变状态的 command execution 单独审批。
- 对包含 private context 的 network calls 单独审批。
- Credentials 不进入 prompts、logs 或 repository files。

## Reliability Controls

Reliability controls 应该让 failure 更容易被发现和恢复：

- 明确 task scope。
- 对多步骤修改使用 checklist。
- 依赖 generated structured data 前先验证。
- 对 parsing、formatting 和 file operations 优先使用 deterministic tools。
- 当事实无法验证时记录 assumptions。
- 当 model、tool 或 network calls 失败时使用 fallbacks。

## Failure Modes

重要 failure modes 包括：

- 模型输出过度自信。
- 意外披露 private context。
- Tool execution 超出预期范围。
- Retry loops 增加成本但不提升质量。
- Silent partial completion。
- 文档暗示项目成熟度高于实际情况。

## Conservative Defaults

对个人 deployment 来说，保守默认值是优点：

- 风险不清楚时先询问。
- 偏向更小 scope。
- 偏向可逆操作。
- 对敏感上下文优先 local processing。
- 偏向诚实的不确定性，而不是漂亮但无依据的猜测。
