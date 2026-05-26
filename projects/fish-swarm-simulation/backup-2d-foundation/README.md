# Fish School Foundation

这是一个干净的 2D prototype，用于验证 fish-school movement、mouse-predator avoidance，以及最小 click-to-bite hunt loop。

这个版本刻意保持小范围。目标是在加入更多 game systems 前，让鱼群看起来自然，让 mouse avoidance 易读，并保持 tuning 简单。

App 包含多种 UI language options。默认语言是 English，可以在 rules screen 或 top bar 中切换。

## Tech Stack

- Vite
- React
- TypeScript
- HTML Canvas 2D API
- `requestAnimationFrame`

这个版本不使用 Three.js、React Three Fiber、WebGL、physics engine 或 heavy UI framework。

## Commands

安装：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

Lint：

```bash
npm run lint
```

Test：

```bash
npm run test
```

Build：

```bash
npm run build
```

## How To Use

从 top bar 打开 rules page，准备好后开始 hunt。把鼠标移动到 water canvas 上，cursor 会作为 predator：

- orange predator silhouette 是 predator position；
- 大的 orange circle 是 fish sensing radius；
- 小的 red circle 是 bite radius；
- radius 内的鱼会平滑躲避；
- left click 会在小 radius 内 bite；
- biting 是 deterministic：bite radius 内的鱼只有在 speed 低于 kill-speed threshold 且 companion count 低于 companion threshold 时才会被 killed；
- isolated 或 slowed fish 因此是更可靠的目标；
- 被许多 companions 包围的鱼更安全；
- 如果 bite 没有杀死任何鱼，会有额外鱼进入 tank，作为 miss cost；
- penalties 只有在 cursor 实际重叠许多鱼并进入小 contact radius 时触发；
- 如果 predator 以很高速度撞入 contacted fish，会有额外鱼作为 penalty 进入；
- 如果 predator 在实际接触许多鱼时停留过久，也会有额外鱼作为 pressure penalty 进入；
- optional abilities 可以在 Controls 中启用：hold right mouse for black-hole bite、Shift + left click to scatter fish、Alt/Option + left click to place a decoy；
- 清空所有鱼后完成当前 tank；
- 鼠标离开 canvas 时，predator influence 会关闭。

Controls panel 默认关闭，避免遮挡 tank。使用 Controls button 打开后，可以选择 Easy / Normal / Hard、pause、reset、修改 fish count，并调整核心 movement parameters。

最多可以保存三个 custom parameter versions。Custom Presets 会把当前完整设置写入 `localStorage`，之后可以 load 或 delete 每个 slot。

## Boids Behavior

Simulation 是一个基础 Boids-style model，灵感来自 Craig Reynolds：

- **Separation:** 附近鱼彼此推开，避免重叠。
- **Alignment:** 鱼转向附近 neighbors 的平均朝向。
- **Cohesion:** 鱼向附近 group centers 转向，让鱼群被扰动后重新聚合。
- **Boundary avoidance:** 靠近 canvas 边缘的鱼会获得平滑向内 steering force。
- **Predator avoidance:** 大 sensing radius 内的鱼按距离强度躲避。
- **Local drag benefit:** 附近 companions 多的鱼可以游得更快；孤立鱼失去这个速度优势。
- **School intent:** 可选模式添加更大尺度 movement goals，包括 center orbit 和 tank-loop circulation。

当前 neighbor search 使用小型 uniform grid / spatial hash。这能让 500+ fish range 仍然可用，同时保持代码可读。

行为参考：

- [Craig Reynolds' Boids model](https://www.red3d.com/cwr/boids/)：separation、alignment、cohesion 和 local neighborhoods。
- Couzin-style zone models：short-range repulsion、orientation/alignment 和 longer-range attraction。
- Predator-avoidance modelling：展示 large groups 如何降低 predation risk，以及 splitting/reunion patterns。
- Hydrodynamic fish-schooling work：指出 group 中个体可能通过 fluid interactions 游得更快。

这些 reference 用来启发 simulation rules。没有把外部实现复制进项目。

## Current Controls

Basic：

- Fish Count
- Difficulty
- Custom Presets 1-3
- School Mode
- Pause / Resume
- Reset

Movement：

- Speed
- Max Force

Boids：

- Separation
- Alignment
- Cohesion

Predator：

- Sense Radius
- Avoid Strength
- Bite Radius
- Kill Speed Threshold
- Kill Companion Threshold
- Show sense radius
- Show bite radius

Penalties：

- Enable contact penalty
- Contact radius
- Contact fish count
- Penalty fish added
- Crash speed threshold
- Dwell seconds

Special Abilities：

- Right hold: black-hole bite
- Black-hole pull radius / pull / kill radius
- Shift + left click: scatter
- Scatter radius / strength
- Alt/Option + left click: decoy
- Decoy fear radius / strength / lifetime

Advanced：

- Separation radius
- Alignment radius
- Cohesion radius
- Velocity vectors
- Show FPS

## Explicitly Not Implemented

这个 foundation 不包含：

- 3D rendering；
- Three.js 或 React Three Fiber；
- camera control 或 pointer lock；
- WASD predator control；
- scoring；
- timer；
- upgrades；
- skills；
- bait ball 或 milling state machines；
- sound；
- particles；
- dark cinematic effects。

## Iteration Path

```text
Step 1: Tune 2D fish schooling and mouse avoidance until it is natural, beautiful, and stable
Step 2: Add clearer group shapes, such as milling / bait ball
Step 3: Balance click-to-bite predator eating mechanics
Step 4: Consider keyboard control, upgrades, timer, and a formal game loop
Step 5: Only then consider 2.5D or richer visual packaging
```
