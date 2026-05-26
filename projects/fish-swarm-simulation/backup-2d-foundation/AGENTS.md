# Fish School Foundation - Agent Notes

## Current Direction

这个项目已经 reset 到一个简单的 2D fish-school behavior foundation。
之前的 3D game attempt 保存在 `legacy-3d-attempt/`，不能被当前 app 导入。

## Hard Scope For This Version

- 使用 Vite + React + TypeScript + HTML Canvas 2D。
- 不使用 Three.js、React Three Fiber、WebGL、3D camera controls、pointer lock、upgrades、scoring、eating、timing 或 formal game loop。
- 当前核心循环是 fish schooling、mouse-predator avoidance、deterministic left-click biting、optional contact penalties 和 lightweight special abilities。
- UI 保持明亮、清晰、易观察。
- 参数保持有用并分组；controls panel 默认隐藏，避免挡住 tank。
- Simulation logic 必须和 canvas rendering 分离。

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`

## Current App Structure

- `src/components/FishCanvas.tsx`：canvas、animation loop、pointer tracking。
- `src/components/ControlPanel.tsx`：minimal live controls。
- `src/simulation/boids.ts`：2D boids update logic。
- `src/simulation/vector.ts`：small vector helpers。
- `src/simulation/createFish.ts`：deterministic fish generation。
- `src/simulation/settings.ts`：default tunings。

## Iteration Order

1. 让 2D school 自然游动。
2. 调整 mouse avoidance，直到视觉效果稳定自然。
3. 确保危险结束后鱼群会 regroup。
4. 平衡 deterministic biting、contact-only penalties 和 special abilities。
5. 之后再考虑 milling / bait ball、keyboard predator control、upgrades 和更大的 game systems。
