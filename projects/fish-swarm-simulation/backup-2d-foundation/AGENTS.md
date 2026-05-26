# Fish School Foundation - Agent 协作说明

## 当前方向

这个项目已经回到一个简单的 2D 鱼群行为基础版本。
之前的 3D 游戏尝试保存在 `legacy-3d-attempt/`，不能被当前应用导入。

## 当前版本的明确范围

- 使用 Vite + React + TypeScript + HTML Canvas 2D。
- 不使用 Three.js、React Three Fiber、WebGL、3D 摄像机控制、pointer lock、升级、计分、进食、计时或正式游戏循环。
- 当前核心循环是鱼群游动、鼠标捕食者躲避、确定性左键咬击、可选接触惩罚和轻量特殊能力。
- UI 保持明亮、清晰、易观察。
- 参数保持有用并分组；控制面板默认隐藏，避免挡住鱼缸。
- 仿真逻辑必须和 Canvas 渲染分离。

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

## 迭代顺序

1. 让 2D 鱼群自然游动。
2. 调整鼠标躲避，直到视觉效果稳定自然。
3. 确保危险结束后鱼群会重新聚合。
4. 平衡确定性咬击、只在接触时触发的惩罚和特殊能力。
5. 之后再考虑 milling / bait ball、键盘控制捕食者、升级系统和更大的游戏系统。
