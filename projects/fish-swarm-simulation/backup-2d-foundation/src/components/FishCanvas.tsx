import { useEffect, useRef, type MutableRefObject } from 'react';
import { createFish, createReinforcementFish } from '../simulation/createFish';
import { stepBoids } from '../simulation/boids';
import { resolveBite } from '../simulation/bite';
import type { Decoy, Fish, Predator, SimulationSettings } from '../simulation/types';
import type { Language } from '../i18n';
import { copy } from '../i18n';

type FishCanvasProps = {
  settings: SimulationSettings;
  paused: boolean;
  resetSeed: number;
  onFpsChange: (fps: number) => void;
  onFishCountChange: (count: number) => void;
  language: Language;
};

type Bounds = {
  width: number;
  height: number;
};

export function FishCanvas({
  settings,
  paused,
  resetSeed,
  onFpsChange,
  onFishCountChange,
  language,
}: FishCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fishRef = useRef<Fish[]>([]);
  const predatorRef = useRef<Predator>({ x: 0, y: 0, active: false });
  const decoysRef = useRef<Decoy[]>([]);
  const settingsRef = useRef(settings);
  const pausedRef = useRef(paused);
  const boundsRef = useRef<Bounds>({ width: 900, height: 600 });
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const fishCountSettingRef = useRef(settings.fishCount);
  const nextFishIdRef = useRef(settings.fishCount);
  const biteFeedbackRef = useRef({ x: 0, y: 0, radius: 0, life: 0, killed: 0, candidates: 0 });
  const penaltyFeedbackRef = useRef({ x: 0, y: 0, life: 0, label: '' });
  const predatorMotionRef = useRef({ x: 0, y: 0, speed: 0, dwell: 0, cooldown: 0, initialized: false });
  const blackHoleRef = useRef(false);
  const nextDecoyIdRef = useRef(1);
  const fpsRef = useRef({ frames: 0, elapsed: 0 });

  useEffect(() => {
    settingsRef.current = settings;
    if (fishCountSettingRef.current !== settings.fishCount) {
      fishCountSettingRef.current = settings.fishCount;
      fishRef.current = createFish(
        settings.fishCount,
        boundsRef.current.width,
        boundsRef.current.height,
        resetSeed + settings.fishCount * 17,
      );
      nextFishIdRef.current = settings.fishCount;
      onFishCountChange(settings.fishCount);
    }
  }, [settings, resetSeed, onFishCountChange]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      boundsRef.current = { width: rect.width, height: rect.height };
      const context = canvas.getContext('2d');
      if (context) {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (fishRef.current.length === 0) {
        fishRef.current = createFish(settingsRef.current.fishCount, rect.width, rect.height, resetSeed);
        onFishCountChange(fishRef.current.length);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [onFishCountChange, resetSeed]);

  useEffect(() => {
    fishRef.current = createFish(
      settingsRef.current.fishCount,
      boundsRef.current.width,
      boundsRef.current.height,
      resetSeed,
    );
    elapsedRef.current = 0;
    decoysRef.current = [];
    blackHoleRef.current = false;
    fishCountSettingRef.current = settingsRef.current.fishCount;
    nextFishIdRef.current = settingsRef.current.fishCount;
    onFishCountChange(fishRef.current.length);
  }, [resetSeed, onFishCountChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const setPredator = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const motion = predatorMotionRef.current;
      predatorRef.current = {
        x,
        y,
        active: true,
      };
      if (!motion.initialized) {
        motion.x = x;
        motion.y = y;
        motion.initialized = true;
      }
    };

    const clearPredator = () => {
      predatorRef.current.active = false;
      blackHoleRef.current = false;
      predatorMotionRef.current.initialized = false;
      predatorMotionRef.current.dwell = 0;
    };

    const bite = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      predatorRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };

      if (event.button === 2) {
        blackHoleRef.current = settingsRef.current.blackHoleEnabled;
        return;
      }

      if (event.button !== 0) {
        return;
      }
      if (fishRef.current.length === 0) {
        return;
      }

      if (event.altKey && settingsRef.current.decoyEnabled) {
        decoysRef.current.push({
          id: nextDecoyIdRef.current,
          x: predatorRef.current.x,
          y: predatorRef.current.y,
          life: settingsRef.current.decoyLifetime,
        });
        nextDecoyIdRef.current += 1;
        return;
      }

      if (event.shiftKey && settingsRef.current.scatterEnabled) {
        applyScatterPulse(fishRef.current, predatorRef.current, settingsRef.current);
        biteFeedbackRef.current = {
          x: predatorRef.current.x,
          y: predatorRef.current.y,
          radius: settingsRef.current.scatterRadius,
          life: 0.22,
          killed: 0,
          candidates: 0,
        };
        return;
      }

      const result = resolveBite(fishRef.current, predatorRef.current, settingsRef.current);
      if (result.killedIds.size > 0) {
        fishRef.current = fishRef.current.filter((item) => !result.killedIds.has(item.id));
      } else {
        const additions = createReinforcementFish(
          settingsRef.current.missSpawnCount,
          boundsRef.current.width,
          boundsRef.current.height,
          Math.floor(performance.now()) + nextFishIdRef.current,
          nextFishIdRef.current,
        );
        nextFishIdRef.current += additions.length;
        fishRef.current = fishRef.current.concat(additions);
      }
      onFishCountChange(fishRef.current.length);
      biteFeedbackRef.current = {
        x: predatorRef.current.x,
        y: predatorRef.current.y,
        radius: settingsRef.current.biteRadius,
        life: 0.22,
        killed: result.killedIds.size,
        candidates: result.candidates,
      };
    };

    const stopBlackHole = () => {
      blackHoleRef.current = false;
    };

    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    canvas.addEventListener('pointermove', setPredator);
    canvas.addEventListener('pointerenter', setPredator);
    canvas.addEventListener('pointerleave', clearPredator);
    canvas.addEventListener('pointerdown', bite);
    canvas.addEventListener('pointerup', stopBlackHole);
    canvas.addEventListener('pointercancel', stopBlackHole);
    canvas.addEventListener('contextmenu', preventContextMenu);

    return () => {
      canvas.removeEventListener('pointermove', setPredator);
      canvas.removeEventListener('pointerenter', setPredator);
      canvas.removeEventListener('pointerleave', clearPredator);
      canvas.removeEventListener('pointerdown', bite);
      canvas.removeEventListener('pointerup', stopBlackHole);
      canvas.removeEventListener('pointercancel', stopBlackHole);
      canvas.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [onFishCountChange]);

  useEffect(() => {
    const loop = (time: number) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (!canvas || !context) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      const lastTime = lastTimeRef.current ?? time;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTimeRef.current = time;

      if (!pausedRef.current) {
        elapsedRef.current += dt;
        const blackHoleActive = blackHoleRef.current && predatorRef.current.active && settingsRef.current.blackHoleEnabled;
        stepBoids(
          fishRef.current,
          blackHoleActive ? { ...predatorRef.current, active: false } : predatorRef.current,
          settingsRef.current,
          boundsRef.current,
          dt,
          elapsedRef.current,
          decoysRef.current,
        );
        updateDecoys(decoysRef.current, dt);
        if (blackHoleActive) {
          applyBlackHole(
            fishRef,
            predatorRef.current,
            settingsRef.current,
            dt,
            onFishCountChange,
          );
        }
        applyPredatorPenalty(
          fishRef,
          predatorRef.current,
          predatorMotionRef.current,
          settingsRef.current,
          boundsRef.current,
          dt,
          nextFishIdRef,
          penaltyFeedbackRef.current,
          copy[language],
          onFishCountChange,
        );
        biteFeedbackRef.current.life = Math.max(0, biteFeedbackRef.current.life - dt);
        penaltyFeedbackRef.current.life = Math.max(0, penaltyFeedbackRef.current.life - dt);
      }

      drawScene(
        context,
        fishRef.current,
        predatorRef.current,
        decoysRef.current,
        settingsRef.current,
        boundsRef.current,
        biteFeedbackRef.current,
        penaltyFeedbackRef.current,
        blackHoleRef.current,
      );
      updateFps(dt, fpsRef.current, onFpsChange);
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [language, onFishCountChange, onFpsChange]);

  return (
    <div className="canvas-card">
      <canvas ref={canvasRef} aria-label="2D fish school simulation" />
    </div>
  );
}

function drawScene(
  context: CanvasRenderingContext2D,
  fish: Fish[],
  predator: Predator,
  decoys: Decoy[],
  settings: SimulationSettings,
  bounds: Bounds,
  biteFeedback: { x: number; y: number; radius: number; life: number; killed: number; candidates: number },
  penaltyFeedback: { x: number; y: number; life: number; label: string },
  blackHoleActive: boolean,
): void {
  context.clearRect(0, 0, bounds.width, bounds.height);
  drawWater(context, bounds);

  if (predator.active && settings.showPredatorRadius) {
    drawPredatorRadius(context, predator, settings.predatorRadius);
  }

  if (predator.active && settings.showBiteRadius) {
    drawBiteRadius(context, predator, settings.biteRadius);
  }

  for (const item of fish) {
    drawFish(context, item, settings.showVelocityVectors);
  }

  for (const decoy of decoys) {
    drawDecoy(context, decoy, settings);
  }

  if (blackHoleActive && predator.active && settings.blackHoleEnabled) {
    drawBlackHole(context, predator, settings);
  }

  if (biteFeedback.life > 0) {
    drawBiteFeedback(context, biteFeedback);
  }

  if (penaltyFeedback.life > 0) {
    drawPenaltyFeedback(context, penaltyFeedback);
  }

  if (predator.active) {
    drawPredator(context, predator);
  }
}

function applyPredatorPenalty(
  fishRef: MutableRefObject<Fish[]>,
  predator: Predator,
  motion: { x: number; y: number; speed: number; dwell: number; cooldown: number; initialized: boolean },
  settings: SimulationSettings,
  bounds: Bounds,
  dt: number,
  nextFishIdRef: MutableRefObject<number>,
  feedback: { x: number; y: number; life: number; label: string },
  labels: Record<string, string>,
  onFishCountChange: (count: number) => void,
): void {
  motion.cooldown = Math.max(0, motion.cooldown - dt);

  if (!settings.penaltyEnabled || !predator.active) {
    motion.dwell = 0;
    return;
  }

  if (motion.initialized && dt > 0) {
    const dx = predator.x - motion.x;
    const dy = predator.y - motion.y;
    const instantSpeed = Math.hypot(dx, dy) / dt;
    motion.speed += (instantSpeed - motion.speed) * 0.45;
  }
  motion.x = predator.x;
  motion.y = predator.y;
  motion.initialized = true;

  const pressure = countFishNear(fishRef.current, predator.x, predator.y, settings.penaltyContactRadius);
  const inLargeSchool = pressure >= settings.penaltyContactCount;
  motion.dwell = inLargeSchool ? motion.dwell + dt : Math.max(0, motion.dwell - dt * 1.8);

  const crash = motion.speed > settings.penaltySpeedThreshold && inLargeSchool;
  const dwell = motion.dwell > settings.penaltyDwellSeconds && inLargeSchool;
  if (motion.cooldown > 0 || (!crash && !dwell)) {
    return;
  }

  const spawnCount = Math.max(0, settings.penaltyCost);
  if (spawnCount === 0) {
    motion.cooldown = 2.1;
    motion.dwell = 0;
    return;
  }
  const additions = createReinforcementFish(
    spawnCount,
    bounds.width,
    bounds.height,
    Math.floor(performance.now()) + nextFishIdRef.current + spawnCount,
    nextFishIdRef.current,
  );
  nextFishIdRef.current += additions.length;
  fishRef.current = fishRef.current.concat(additions);
  onFishCountChange(fishRef.current.length);
  feedback.x = predator.x;
  feedback.y = predator.y;
  feedback.life = 1.1;
  feedback.label = crash ? labels.penaltyCrash : labels.penaltyDwell;
  motion.cooldown = 2.1;
  motion.dwell = 0;
}

function updateDecoys(decoys: Decoy[], dt: number): void {
  for (const decoy of decoys) {
    decoy.life -= dt;
  }
  for (let index = decoys.length - 1; index >= 0; index -= 1) {
    if (decoys[index].life <= 0) {
      decoys.splice(index, 1);
    }
  }
}

function applyScatterPulse(fish: Fish[], predator: Predator, settings: SimulationSettings): void {
  for (const item of fish) {
    const dx = item.x - predator.x;
    const dy = item.y - predator.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0 || distance > settings.scatterRadius) {
      continue;
    }
    const falloff = (1 - distance / settings.scatterRadius) ** 1.35;
    item.vx += (dx / distance) * settings.scatterStrength * falloff;
    item.vy += (dy / distance) * settings.scatterStrength * falloff;
    item.panic = Math.max(item.panic, 0.95 * falloff);
    item.density = Math.max(0, item.density - 0.45 * falloff);
  }
}

function applyBlackHole(
  fishRef: MutableRefObject<Fish[]>,
  predator: Predator,
  settings: SimulationSettings,
  dt: number,
  onFishCountChange: (count: number) => void,
): void {
  const killedIds = new Set<number>();
  for (const item of fishRef.current) {
    const dx = predator.x - item.x;
    const dy = predator.y - item.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0 || distance > settings.blackHoleRadius) {
      continue;
    }
    if (distance <= settings.blackHoleKillRadius) {
      killedIds.add(item.id);
      continue;
    }
    const falloff = (1 - distance / settings.blackHoleRadius) ** 1.2;
    const pull = settings.blackHolePullStrength * falloff * dt;
    item.vx += (dx / distance) * pull;
    item.vy += (dy / distance) * pull;
    item.panic = Math.max(item.panic, 0.8 * falloff);
  }

  if (killedIds.size > 0) {
    fishRef.current = fishRef.current.filter((item) => !killedIds.has(item.id));
    onFishCountChange(fishRef.current.length);
  }
}

function countFishNear(fish: Fish[], x: number, y: number, radius: number): number {
  const radiusSquared = radius * radius;
  let count = 0;
  for (const item of fish) {
    const dx = item.x - x;
    const dy = item.y - y;
    if (dx * dx + dy * dy <= radiusSquared) {
      count += 1;
    }
  }
  return count;
}

function drawWater(context: CanvasRenderingContext2D, bounds: Bounds): void {
  const gradient = context.createLinearGradient(0, 0, bounds.width, bounds.height);
  gradient.addColorStop(0, '#dff8ff');
  gradient.addColorStop(0.42, '#a9dcf1');
  gradient.addColorStop(1, '#6fb2d1');
  context.fillStyle = gradient;
  context.fillRect(0, 0, bounds.width, bounds.height);

  context.save();
  context.globalAlpha = 0.12;
  context.strokeStyle = '#ffffff';
  context.lineWidth = 1;
  for (let y = 28; y < bounds.height; y += 42) {
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= bounds.width; x += 28) {
      context.lineTo(x, y + Math.sin(x * 0.018 + y * 0.03) * 5);
    }
    context.stroke();
  }
  context.restore();
}

function drawFish(context: CanvasRenderingContext2D, fish: Fish, showVelocity: boolean): void {
  const angle = Math.atan2(fish.vy, fish.vx);
  const bodyLength = 16;
  const bodyWidth = 4.4;
  const panic = fish.panic;
  const densityGlow = fish.density * 0.18;

  context.save();
  context.translate(fish.x, fish.y);
  context.rotate(angle);

  context.fillStyle = panic > 0.08
    ? `rgb(${70 + panic * 115}, ${118 + panic * 64}, ${148})`
    : `rgb(${23 + densityGlow * 40}, ${76 + densityGlow * 60}, ${112 + densityGlow * 80})`;
  context.strokeStyle = 'rgba(255, 255, 255, 0.86)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(bodyLength * 0.55, 0);
  context.quadraticCurveTo(bodyLength * 0.12, -bodyWidth * 1.08, -bodyLength * 0.44, -bodyWidth * 0.48);
  context.quadraticCurveTo(-bodyLength * 0.24, 0, -bodyLength * 0.44, bodyWidth * 0.48);
  context.quadraticCurveTo(bodyLength * 0.12, bodyWidth * 1.08, bodyLength * 0.55, 0);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = 'rgba(255, 255, 255, 0.55)';
  context.beginPath();
  context.ellipse(bodyLength * 0.08, -bodyWidth * 0.28, bodyLength * 0.24, bodyWidth * 0.22, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = panic > 0.08 ? 'rgba(255, 149, 84, 0.82)' : 'rgba(224, 247, 255, 0.9)';
  context.beginPath();
  context.moveTo(-bodyLength * 0.4, 0);
  context.lineTo(-bodyLength * 0.94, -bodyWidth * 1.05);
  context.lineTo(-bodyLength * 0.72, 0);
  context.lineTo(-bodyLength * 0.94, bodyWidth * 1.05);
  context.closePath();
  context.fill();

  context.fillStyle = 'rgba(12, 47, 70, 0.72)';
  context.beginPath();
  context.moveTo(-bodyLength * 0.04, -bodyWidth * 0.74);
  context.lineTo(-bodyLength * 0.28, -bodyWidth * 1.34);
  context.lineTo(bodyLength * 0.12, -bodyWidth * 0.7);
  context.closePath();
  context.fill();

  context.fillStyle = '#061b2a';
  context.beginPath();
  context.arc(bodyLength * 0.32, -bodyWidth * 0.25, 1.25, 0, Math.PI * 2);
  context.fill();

  if (showVelocity) {
    context.strokeStyle = 'rgba(24, 82, 120, 0.36)';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(18, 0);
    context.stroke();
  }

  context.restore();
}

function drawPredatorRadius(
  context: CanvasRenderingContext2D,
  predator: Predator,
  radius: number,
): void {
  context.save();
  context.fillStyle = 'rgba(255, 113, 67, 0.09)';
  context.strokeStyle = 'rgba(220, 70, 38, 0.38)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(predator.x, predator.y, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawBiteRadius(
  context: CanvasRenderingContext2D,
  predator: Predator,
  radius: number,
): void {
  context.save();
  context.strokeStyle = 'rgba(190, 35, 21, 0.78)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(predator.x, predator.y, radius, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawBiteFeedback(
  context: CanvasRenderingContext2D,
  feedback: { x: number; y: number; radius: number; life: number; killed: number; candidates: number },
): void {
  const progress = feedback.life / 0.22;
  context.save();
  context.strokeStyle = feedback.killed > 0 ? `rgba(190, 35, 21, ${progress})` : `rgba(40, 88, 122, ${progress})`;
  context.fillStyle = feedback.killed > 0 ? `rgba(255, 88, 56, ${progress * 0.16})` : `rgba(255, 255, 255, ${progress * 0.18})`;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(feedback.x, feedback.y, feedback.radius + (1 - progress) * 18, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  if (feedback.candidates > 0) {
    context.fillStyle = `rgba(24, 54, 73, ${progress})`;
    context.font = '700 13px Inter, system-ui, sans-serif';
    context.fillText(`-${feedback.killed}`, feedback.x + feedback.radius + 8, feedback.y - 4);
  }
  context.restore();
}

function drawBlackHole(
  context: CanvasRenderingContext2D,
  predator: Predator,
  settings: SimulationSettings,
): void {
  context.save();
  const gradient = context.createRadialGradient(
    predator.x,
    predator.y,
    settings.blackHoleKillRadius,
    predator.x,
    predator.y,
    settings.blackHoleRadius,
  );
  gradient.addColorStop(0, 'rgba(95, 25, 120, 0.5)');
  gradient.addColorStop(0.38, 'rgba(176, 66, 190, 0.18)');
  gradient.addColorStop(1, 'rgba(176, 66, 190, 0)');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(predator.x, predator.y, settings.blackHoleRadius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(112, 36, 138, 0.7)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(predator.x, predator.y, settings.blackHoleKillRadius, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawDecoy(context: CanvasRenderingContext2D, decoy: Decoy, settings: SimulationSettings): void {
  const alpha = Math.min(1, decoy.life / Math.max(settings.decoyLifetime, 0.001));
  context.save();
  context.strokeStyle = `rgba(31, 101, 154, ${0.55 * alpha})`;
  context.fillStyle = `rgba(255, 255, 255, ${0.18 * alpha})`;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(decoy.x, decoy.y, settings.decoyRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = `rgba(25, 84, 128, ${0.86 * alpha})`;
  context.beginPath();
  context.arc(decoy.x, decoy.y, 8, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
  context.beginPath();
  context.moveTo(decoy.x - 12, decoy.y);
  context.lineTo(decoy.x + 12, decoy.y);
  context.moveTo(decoy.x, decoy.y - 12);
  context.lineTo(decoy.x, decoy.y + 12);
  context.stroke();
  context.restore();
}

function drawPenaltyFeedback(
  context: CanvasRenderingContext2D,
  feedback: { x: number; y: number; life: number; label: string },
): void {
  const alpha = Math.min(1, feedback.life);
  context.save();
  context.fillStyle = `rgba(255, 246, 235, ${0.92 * alpha})`;
  context.strokeStyle = `rgba(190, 68, 32, ${0.8 * alpha})`;
  context.lineWidth = 2;
  const text = `+ ${feedback.label}`;
  context.font = '800 14px Inter, system-ui, sans-serif';
  const width = context.measureText(text).width + 22;
  const x = Math.min(Math.max(12, feedback.x + 18), context.canvas.clientWidth - width - 12);
  const y = Math.max(70, feedback.y - 28);
  context.beginPath();
  context.roundRect(x, y, width, 32, 8);
  context.fill();
  context.stroke();
  context.fillStyle = `rgba(105, 39, 22, ${alpha})`;
  context.fillText(text, x + 11, y + 21);
  context.restore();
}

function drawPredator(context: CanvasRenderingContext2D, predator: Predator): void {
  context.save();
  context.translate(predator.x, predator.y);
  context.fillStyle = '#d94627';
  context.strokeStyle = '#ffffff';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(14, 0);
  context.lineTo(-4, -9);
  context.lineTo(-12, -3);
  context.lineTo(-19, -9);
  context.lineTo(-16, 0);
  context.lineTo(-19, 9);
  context.lineTo(-12, 3);
  context.lineTo(-4, 9);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = '#fff2e9';
  context.beginPath();
  context.arc(5, -2.5, 1.6, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function updateFps(
  dt: number,
  tracker: { frames: number; elapsed: number },
  onFpsChange: (fps: number) => void,
): void {
  tracker.frames += 1;
  tracker.elapsed += dt;
  if (tracker.elapsed >= 0.35) {
    onFpsChange(Math.round(tracker.frames / tracker.elapsed));
    tracker.frames = 0;
    tracker.elapsed = 0;
  }
}
