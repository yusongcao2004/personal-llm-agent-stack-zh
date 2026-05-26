# Lessons Learned

这个项目是 documentation-focused portfolio，所以经验主要来自如何负责任地设计和解释个人 LLM Agent stack。

## 1. Documentation Is Part of the System

Agent behavior 取决于 configuration、model choice、tool permissions 和 user expectations。如果这些决策没有文档化，即使工具能运行，系统也会更难评估。

## 2. Local Deployment Is a Tradeoff, Not a Slogan

Local-first design 可以改善 privacy、latency 和 inspectability，但也带来 hardware limits、model quality、dependency management 和 fallback behavior 等问题。好的文档应该同时说清楚两面。

## 3. Routing Is an Engineering Decision

Model routing 连接技术与实际约束。Routing strategy 应考虑 task type、cost、latency、privacy 和 risk，而不是固定偏好某一个模型。

## 4. Cost Controls Shape Product Behavior

Cost-aware orchestration 会影响 agent 如何收集 context、retry failed steps、升级到更强模型，以及何时使用 deterministic tool 代替另一轮 model call。

## 5. Human Review Is a Feature

Human-in-the-loop safety 不只是限制。它能让个人 Agent 更可信，因为有影响的决策保持可见，也更容易回滚。

## 6. Reliability Starts With Boundaries

围绕 file access、network calls、credentials、logs 和 tool permissions 建立清晰边界，能让系统更容易推理，也能减少夸大项目能力的诱惑。

## 7. Honest Positioning Builds Trust

最重要的作品集经验是精准定位项目。本仓库记录 personal deployment、configuration、routing 和 safety thinking。它不需要假装成 production platform 才有价值。
