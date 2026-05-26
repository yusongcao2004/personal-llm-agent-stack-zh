# Fish School Foundation - Agent Notes

## Current Direction

这个项目保留简单的 2D fish-school behavior foundation，并单独放置一个 3D fish-tank experiment。
之前复杂的 3D game attempt 已经有意排除在 portfolio import 之外。
稳定的 2D snapshot 保存在 `backup-2d-foundation/`。

## Hard Scope For This Version

- 使用 Vite + React + TypeScript。
- 2D foundation 使用 HTML Canvas 2D。
- 3D fish-tank experiment 可以使用 Three.js、React Three Fiber 和 Drei。
- 3D experiment 当前有意使用 pointer lock，让鼠标可以旋转鱼缸外 camera 而不离开页面；`Esc` 释放 cursor 并暂停观察。
- 暂时不要给 3D experiment 添加 upgrades、scoring、eating、timing 或 formal game loop。
- 当前核心循环是 fish schooling、mouse-predator avoidance、deterministic left-click biting、optional contact penalties 和 lightweight special abilities。
- UI 保持明亮、清晰、易观察。
- 参数保持有用并分组；controls panel 默认隐藏，避免挡住鱼缸。
- Simulation logic 必须和 canvas rendering 分离。
- 保留 `/2d` 和 `/3d` entries。2D version 必须继续可用。

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
- `src/experiments/fish-school-2d/`：active 2D page wrapper。
- `src/experiments/fish-tank-3d/`：3D fish-tank experiment。

## Iteration Order

1. 让 2D school 自然游动。
2. 调整 mouse avoidance，直到视觉效果稳定自然。
3. 确保危险结束后鱼群会 regroup。
4. 平衡 deterministic biting、contact-only penalties 和 special abilities。
5. 之后再考虑 milling / bait ball、keyboard predator control、upgrades 和更大的 game systems。
