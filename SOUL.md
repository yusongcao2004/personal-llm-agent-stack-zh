# Project Soul

这个项目关注的是个人 Agent system 在成为产品之前应该是什么样子。

核心想法是：有用的 LLM Agent stack 不只是模型和工具的组合，也是一组工作习惯：什么时候请求帮助，什么时候保持本地执行，什么时候花更多 model budget，什么时候放慢，以及什么时候把最终决定留给人。

## Design Values

- **Honesty:** 说清楚已经存在什么、什么只是设想、什么还没有做。
- **User agency:** 对敏感或有后果的动作，保持用户控制。
- **Local awareness:** 把 local deployment 当作有 privacy 和 reliability 含义的设计选择。
- **Operational humility:** 偏向保守表述，而不是夸张但无法验证的说法。
- **System thinking:** 把 model behavior 和 routing、cost、safety、reliability 连接起来。

## Agent Experience

这组文档所指向的 agent experience 应该是有用但不过度假装自治。

它应该：

- 解释重要 tradeoffs。
- 保持 scope 清晰。
- 在风险升高时请求确认。
- 谨慎使用 tools。
- 偏向可逆步骤。
- 把 failure 当作信息，而不是需要隐藏的东西。

## Why This Matters

Personal LLM systems 往往从实验开始。如果没有文档，配置会漂移，模型选择会变得随意，安全假设也会停留在隐含状态。

这个仓库的价值在于把这些假设显性化。它的意义是 documentation discipline，而不是声称系统已经完整。
