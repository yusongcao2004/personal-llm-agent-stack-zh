# Fish School Foundation - Agent 协作说明

## 当前方向

这个项目保留简单的 2D 鱼群行为基础版本，并单独放置一个 3D 鱼缸实验。
之前复杂的 3D 游戏尝试已经有意排除在作品集导入之外。
稳定的 2D 快照保存在 `backup-2d-foundation/`。

## 当前版本的明确范围

- 使用 Vite + React + TypeScript。
- 2D 基础版本使用 HTML Canvas 2D。
- 3D 鱼缸实验可以使用 Three.js、React Three Fiber 和 Drei。
- 3D 实验当前有意使用 pointer lock，让鼠标可以旋转鱼缸外视角而不离开页面；`Esc` 释放 cursor 并暂停观察。
- 暂时不要给 3D 实验添加升级、计分、进食、计时或正式游戏循环。
- 当前核心循环是鱼群游动、鼠标捕食者躲避、确定性左键咬击、可选接触惩罚和轻量特殊能力。
- UI 保持明亮、清晰、易观察。
- 参数保持有用并分组；控制面板默认隐藏，避免挡住鱼缸。
- 仿真逻辑必须和 Canvas 渲染分离。
- 保留 `/2d` 和 `/3d` 入口。2D 版本必须继续可用。

## 命令

- 安装：`npm install`
- 开发服务器：`npm run dev`
- Lint：`npm run lint`
- 测试：`npm run test`
- 构建：`npm run build`

## 当前应用结构

- `src/components/FishCanvas.tsx`：Canvas、动画循环、pointer 跟踪。
- `src/components/ControlPanel.tsx`：最小实时控制面板。
- `src/simulation/boids.ts`：2D Boids 更新逻辑。
- `src/simulation/vector.ts`：小型向量辅助函数。
- `src/simulation/createFish.ts`：确定性鱼群生成。
- `src/simulation/settings.ts`：默认参数。
- `src/experiments/fish-school-2d/`：当前 2D 页面包装。
- `src/experiments/fish-tank-3d/`：3D 鱼缸实验。

## 迭代顺序

1. 让 2D 鱼群自然游动。
2. 调整鼠标躲避，直到视觉效果稳定自然。
3. 确保危险结束后鱼群会重新聚合。
4. 平衡确定性咬击、只在接触时触发的惩罚和特殊能力。
5. 之后再考虑 milling / bait ball、键盘控制捕食者、升级系统和更大的游戏系统。
