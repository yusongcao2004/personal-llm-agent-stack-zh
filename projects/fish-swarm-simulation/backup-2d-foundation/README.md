# Fish School Foundation

这是一个干净的 2D 原型，用于验证鱼群移动、鼠标捕食者躲避，以及最小的点击咬击循环。

这个版本刻意保持小范围。目标是在加入更多游戏系统前，让鱼群看起来自然，让鼠标躲避易读，并保持参数调节简单。

应用包含多种界面语言选项。默认语言是 English，可以在规则页或顶部栏切换。

## 技术栈

- Vite
- React
- TypeScript
- HTML Canvas 2D API
- `requestAnimationFrame`

这个版本不使用 Three.js、React Three Fiber、WebGL、physics engine 或 heavy UI framework。

## 命令

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

## 使用方式

从顶部栏打开规则页，准备好后开始捕猎。把鼠标移动到水域 Canvas 上，cursor 会作为捕食者：

- 橙色捕食者轮廓是捕食者位置；
- 大的橙色圆圈是鱼的感知半径；
- 较小的红色圆圈是咬击半径；
- 半径内的鱼会平滑躲避；
- 左键会在小半径内咬击；
- 咬击是确定性的：咬击半径内的鱼，只有在速度低于击杀阈值且附近同伴数量低于同伴阈值时才会被捕食；
- 孤立或变慢的鱼因此是更可靠的目标；
- 被许多同伴包围的鱼更安全；
- 如果一次咬击没有击杀任何鱼，会有额外鱼进入鱼缸，作为咬空成本；
- 惩罚只有在 cursor 实际重叠许多鱼并进入小接触半径时触发；
- 如果捕食者以很高速度撞入接触中的鱼，会有额外鱼作为惩罚进入；
- 如果捕食者在实际接触许多鱼时停留过久，也会有额外鱼作为压力惩罚进入；
- 可选能力可以在控制面板中启用：按住右键触发 black-hole bite、`Shift` + 左键冲散鱼群、`Alt/Option` + 左键放置 decoy；
- 清空所有鱼后完成当前鱼缸；
- 鼠标离开 Canvas 时，捕食者影响会关闭。

控制面板默认关闭，避免遮挡鱼缸。使用控制按钮打开后，可以选择 Easy / Normal / Hard、暂停、重置、修改鱼数量，并调整核心运动参数。

最多可以保存三个自定义参数版本。Custom Presets 会把当前完整设置写入 `localStorage`，之后可以加载或删除每个 slot。

## Boids 行为

仿真是一个基础 Boids-style model，灵感来自 Craig Reynolds：

- **Separation:** 附近鱼彼此推开，避免重叠。
- **Alignment:** 鱼转向附近 neighbors 的平均朝向。
- **Cohesion:** 鱼向附近 group centers 转向，让鱼群被扰动后重新聚合。
- **Boundary avoidance:** 靠近 Canvas 边缘的鱼会获得平滑向内的转向力。
- **Predator avoidance:** 大感知半径内的鱼按距离强度躲避。
- **局部减阻收益：** 附近同伴多的鱼可以游得更快；孤立鱼失去这个速度优势。
- **School intent:** 可选模式添加更大尺度的移动目标，包括 center orbit 和 tank-loop circulation。

当前邻居搜索使用小型 uniform grid / spatial hash。这能让 500+ fish range 仍然可用，同时保持代码可读。

行为参考：

- [Craig Reynolds' Boids model](https://www.red3d.com/cwr/boids/)：separation、alignment、cohesion 和 local neighborhoods。
- Couzin-style zone models：short-range repulsion、orientation/alignment 和 longer-range attraction。
- Predator-avoidance modelling：展示 large groups 如何降低 predation risk，以及 splitting/reunion patterns。
- Hydrodynamic fish-schooling work：指出群体中的个体可能通过 fluid interactions 游得更快。

这些参考用来启发仿真规则。没有把外部实现复制进项目。

## 当前控制项

基础：

- Fish Count
- Difficulty
- Custom Presets 1-3
- School Mode
- Pause / Resume
- Reset

运动：

- Speed
- Max Force

Boids：

- Separation
- Alignment
- Cohesion

捕食者：

- Sense Radius
- Avoid Strength
- Bite Radius
- Kill Speed Threshold
- Kill Companion Threshold
- Show sense radius
- Show bite radius

惩罚：

- Enable contact penalty
- Contact radius
- Contact fish count
- Penalty fish added
- Crash speed threshold
- Dwell seconds

特殊能力：

- Right hold: black-hole bite
- Black-hole pull radius / pull / kill radius
- Shift + left click: scatter
- Scatter radius / strength
- Alt/Option + left click: decoy
- Decoy fear radius / strength / lifetime

高级：

- Separation radius
- Alignment radius
- Cohesion radius
- Velocity vectors
- Show FPS

## 明确未实现的内容

这个基础版本不包含：

- 3D rendering；
- Three.js 或 React Three Fiber；
- 摄像机控制或 pointer lock；
- WASD 捕食者控制；
- 计分；
- 计时器；
- 升级系统；
- 技能系统；
- bait ball 或 milling state machines；
- 声音；
- 粒子效果；
- 暗色电影感特效。

## 迭代路径

```text
Step 1: 调整 2D 鱼群游动和鼠标躲避，直到它自然、美观、稳定
Step 2: 加入更清晰的群体形态，例如 milling / bait ball
Step 3: 平衡点击咬击的捕食机制
Step 4: 考虑键盘控制、升级、计时器和正式游戏循环
Step 5: 之后再考虑 2.5D 或更丰富的视觉包装
```
