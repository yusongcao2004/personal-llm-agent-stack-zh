# Pantheon — Telegram-native Multi-LLM Roundtable

Pantheon 的完整源码维护在独立公开仓库：

https://github.com/yusongcao2004/pantheon-llm-roundtable

这个目录只包含中文 Portfolio case study，不复制 Pantheon 源码。

## 项目目标

Pantheon 探索如何让多个 LLM provider 在 Telegram 群中进行短轮次讨论，同时保持清晰的发言顺序、可控成本、简洁输出和中立汇总。

实际交互方式是：用户在 Telegram 群里 @ 某个 bot，被 @ 的 bot 先发言，其他模型参与 cyclic full-round discussion，最后由内部 synthesis 步骤输出简短中立总结。

## 为什么做它

我做 Pantheon，是为了把 multi-LLM coordination 当成一个真实工程系统来验证，而不是静态 demo。真正有意思的问题包括 provider compatibility、role control、cost control、synthesis constraints、Telegram interaction design，以及 secret-safe public release。

这个项目也展示了 cost-aware orchestration：不是每个参与者都需要旗舰模型，讨论轮次和输出长度也需要有边界。

## 当前四模型结构

| 角色 | 模型 |
| --- | --- |
| GPT participant | `gpt-4o-mini` |
| DeepSeek participant | `deepseek-chat` |
| Doubao participant | `doubao-seed-2-0-mini-260428` |
| Gemini participant | `gemini-3.5-flash` |
| Internal synthesis | `gemini-3.1-flash-lite` |

## 已实现功能

- Telegram-native interaction。
- 任意被 @ 的 bot 都可以先发言。
- 多模型 cyclic full-round discussion。
- 使用 concise prompting 控制输出长度和成本。
- 讨论结束后生成 prompt-constrained neutral synthesis。
- 记录每次讨论的 token/cache statistics。
- 使用环境变量隔离 secrets。

## 工程问题与解决

### Provider-specific API compatibility

不同 provider 接受的 request fields 和 runtime options 并不完全一致。Pantheon 不假设所有模型都能使用同一套 OpenAI-style request shape，而是处理 provider-specific compatibility。

### Cost-driven model downgrade

项目有意在适合的位置使用更小或更便宜的模型。这样能让 roundtable 保持可用，而不是每条消息都变成旗舰模型调用。

### Concise output control

每个 participant 都被要求输出简短内容。讨论轮数也有边界，因此系统在进入 synthesis 前有可预测的成本上限。

### Neutral synthesis limitation

Synthesis 通过 prompt 约束为中立表达，但这不是形式化的无偏保证，也不保证 factual accuracy。Multi-model agreement 不应被当作事实核查。

### Secret-safe GitHub release

Pantheon 的设计要求 tokens、API keys、bot credentials 和环境相关配置不进入 source control。公开文档只描述 setup boundary，不暴露 secret 或 private Telegram group details。

## Demo

后续可以加入脱敏后的 Telegram 截图或 GIF。当前不伪造图片，不添加不存在的 asset，不包含 token、group identifier 或 private conversation content。

## 源码仓库

- [pantheon-llm-roundtable](https://github.com/yusongcao2004/pantheon-llm-roundtable)
