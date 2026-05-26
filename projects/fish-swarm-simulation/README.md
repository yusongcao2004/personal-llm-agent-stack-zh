# Fish Swarm Simulation

## 基于 Codex 协作开发的鱼群智能实验

Fish Swarm Simulation 是一个使用 React、TypeScript、Canvas 2D 和 Three.js 构建的交互式鱼群仿真项目。它探索基于 Boids 的群体运动、捕食者压力、可调仿真参数，以及使用 Codex 作为编程代理从粗原型迭代到稳定演示的过程。

## 演示预览

### 3D 鱼缸实验

![3D Fish Swarm](../../docs/screenshots/fish-swarm/fish-swarm-3d.jpg)

### 2D 行为原型

![2D Fish Swarm](../../docs/screenshots/fish-swarm/fish-swarm-2d.jpg)

当前仓库还没有提交 GIF 或视频。占位说明见 [`docs/demo-gifs/fish-swarm/`](../../docs/demo-gifs/fish-swarm/)。

## 已实现功能

- 2D Canvas 鱼群仿真，带鼠标捕食者交互。
- 3D 鱼缸仿真，使用鱼缸外视角和自动捕食球。
- 基于 Boids 的分离、对齐和聚合行为。
- 2D 和 3D 环境中的平滑边界避让。
- 基于距离和局部威胁的捕食者躲避。
- 基于鱼的速度和附近同伴数量的确定性 2D 咬击机制。
- 2D 接触惩罚、咬空成本，以及可在控制面板中启用的可选能力。
- Sardines、jackfish、herring 风格的 2D 行为预设。
- 3D 捕食者策略，包括 orca carousel、dolphin drive、shark strike、seal ambush。
- 可配置仿真参数、语言选择和可保存的 2D 自定义预设。
- 使用 uniform grid / spatial partitioning 做鱼群邻居查询。
- 使用 Vitest 覆盖核心纯仿真逻辑。

## 交互说明

本地运行应用后打开：

- `/3d`：3D 鱼缸实验。
- `/2d`：2D 基础版本。

在 2D 模式中：

- 在水域上移动鼠标，鼠标会作为捕食者。
- 较大的捕食者半径会触发鱼群躲避。
- 较小的咬击半径用于左键咬击。
- 当鱼足够慢且附近同伴足够少时，可以被捕食。
- 控制面板可以调整鱼数量、难度、鱼群类型、鱼群模式、捕食者设置、惩罚和可选能力。

在 3D 模式中：

- 点击鱼缸锁定 pointer。
- 移动鼠标，从鱼缸外旋转观察视角。
- 按 `Esc` 释放 pointer 并暂停观察。
- 捕食球会自动追逐鱼群。
- 将中心准星对准捕食球并拖动，可以移动该捕食者。
- 摄像机被限制在鱼缸外，不进入鱼缸内部。

## 技术栈

- React
- TypeScript
- Vite
- HTML Canvas 2D API
- Three.js
- React Three Fiber
- `@react-three/drei`
- Vitest
- ESLint

## 与 Codex 协作开发过程中得到的工程经验

这个项目起点是探索鱼群行为和捕食者交互。Codex 被用作编程代理，帮助快速生成、修改、测试和整理原型。

主要工程经验是：AI 辅助编码推进速度很快，但速度越快，范围控制越重要。项目经历了几次方向变化：从简单 2D 行为实验，到更大的 3D 游戏想法，再回到保留稳定基线，并把实验版本和可运行版本分开。

实践经验：

- 添加更丰富视觉或游戏系统前，先保留稳定基线。
- 把实验工作和当前可运行应用分开。
- 结构性修改后使用 `lint`、`test`、`build` 验证。
- 保持仿真逻辑和渲染代码分离。
- 当鱼数量增加时，注意局部邻居搜索带来的性能压力。
- 在这个项目规模下，简单 uniform grid 比完整两两邻居检查更合适。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

运行测试：

```bash
npm run test
```

运行 lint：

```bash
npm run lint
```

构建：

```bash
npm run build
```

## 当前状态

| 部分 | 状态 |
|---|---|
| 核心鱼群仿真 | 稳定原型 |
| 2D 模式 | 已完成的交互式原型 |
| 3D 模式 | 实验性但可运行的鱼缸原型 |
| 捕食者交互 | 已在 2D 和 3D 中实现 |
| 参数调节 | 已实现 |
| 本地化 | 提供多种界面语言选项 |
| 测试 | 核心逻辑已有 Vitest 覆盖 |
| 性能优化 | 使用 uniform grid / spatial partitioning；极高鱼数量仍然是压力场景 |
| 完整游戏循环 | 尚未实现 |

## 与 AI Agent 作品集的关系

这个仿真本身不是 LLM 工作流程。它在作品集中的意义是：我用 Codex 作为编程代理，把一个想法变成交互式系统，迭代行为、调试失败、管理项目范围，并整理成可展示的工程作品。

## 当前限制与后续想法

- 3D 模式是观察实验，不是完整游戏。
- 如果需要动态预览，还需要录制 GIF 或视频演示材料。
- 极高鱼数量仍然可能带来性能压力。
- 后续可以加入更清晰的 milling / bait-ball 状态、正式游戏循环，以及更好的录制和导出工具。
