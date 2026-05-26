# Routing Strategy

Model routing 指的是根据任务选择合适的模型、工具或 workflow，而不是把所有请求都发给同一个 endpoint。

在这个项目中，routing 被当作一个系统工程问题：capability、cost、latency、safety 和 reliability 都需要考虑。

## Routing Goals

- 用 lightweight models 处理简单分类、总结、抽取和格式化任务。
- 对模糊、多步骤或高影响任务使用更强的 reasoning models。
- 当 privacy、latency 或 inspectability 更重要时，优先考虑 local execution。
- 只有在任务确实需要 hosted models 且上下文适合分享时，才升级到外部模型。
- 对有实际影响的动作保留 human approval。

## Routing Inputs

Routing decision 可以考虑：

- **Task type:** drafting、planning、retrieval、tool use、code review、extraction、synthesis。
- **Risk level:** 输出是否会修改文件、花钱、披露数据或影响他人。
- **Context sensitivity:** prompt 是否包含 private、confidential 或 account-specific 信息。
- **Latency tolerance:** 用户是否需要即时回答，还是可以等待更强模型。
- **Cost sensitivity:** 预期 token volume、retry likelihood 和 model pricing。
- **Reliability needs:** 是否需要 verification、deterministic formatting 或 auditability。

## Example Routing Tiers

这些 tier 是概念性的，不表示本仓库包含对应的完整部署实现。

| Tier | 适用场景 | 常见控制 |
| --- | --- | --- |
| Local or small model | 低风险分类、总结、清理、初稿 | Short context、不外传敏感内容、简单验证 |
| General hosted model | 中等复杂度写作、规划、结构化推理 | Cost checks、prompt constraints、行动前 review |
| Strong reasoning model | 复杂决策、不确定任务、安全敏感分析 | Human confirmation、narrower scope、explicit verification |
| Tool-assisted workflow | 文件编辑、搜索、命令执行、外部动作 | Permission checks、dry runs、logs、rollback plan |

## Cost-Aware Orchestration

成本意识不只是选择更便宜的模型，也包括：

- 减少不必要的 context。
- 避免在策略不变时反复 retry。
- 升级到更强模型前先总结中间状态。
- 把 expensive models 留给真正需要它们的任务。
- 对不需要 language generation 的工作使用 deterministic tools。

## Escalation and Fallback

Routing strategy 需要定义第一选择不够用时怎么办：

- 当任务仍然模糊时，从小模型升级到更强模型。
- 当外部调用不可用或不合适时，fallback 到 local 或 manual workflow。
- 对不可逆动作先请求 human confirmation。
- 当 confidence 低时停止，不制造确定性。

## Evaluation Questions

Routing strategy 应该用实际行为来评估：

- 系统是否为任务选择了合适模型？
- 是否避免了不必要的成本？
- 是否保留了用户控制？
- 是否清楚表达了不确定性？
- 当工具或模型不可用时，是否安全失败？
