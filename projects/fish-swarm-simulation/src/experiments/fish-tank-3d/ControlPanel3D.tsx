import type { FishTankSettings3D, PredatorStrategy3D } from './simulation/types';
import type { Language } from '../../i18n';
import { copy } from '../../i18n';

type ControlPanel3DProps = {
  settings: FishTankSettings3D;
  language: Language;
  onChange: (patch: Partial<FishTankSettings3D>) => void;
  onReset: () => void;
  onResetCamera: () => void;
  onClose: () => void;
};

export function ControlPanel3D({
  settings,
  language,
  onChange,
  onReset,
  onResetCamera,
  onClose,
}: ControlPanel3DProps) {
  const t = copy[language];

  return (
    <aside className="control-panel tank3d-panel">
      <div className="panel-title-row">
        <strong>{t.controls3d}</strong>
        <button type="button" onClick={onClose}>×</button>
      </div>

      <section>
        <h2>{t.basic}</h2>
        <Slider label={t.fishCount} value={settings.fishCount} min={50} max={6000} step={1} onChange={(fishCount) => onChange({ fishCount })} />
        <div className="button-row">
          <button type="button" onClick={() => onChange({ paused: !settings.paused })}>
            {settings.paused ? t.resume : t.pause}
          </button>
          <button type="button" onClick={onReset}>{t.reset}</button>
        </div>
      </section>

      <section>
        <h2>{t.movement}</h2>
        <Slider label={t.fishSpeed} value={settings.fishSpeed} min={1.2} max={7} step={0.1} onChange={(fishSpeed) => onChange({ fishSpeed })} />
        <Slider label={t.maxForce} value={settings.maxForce} min={2} max={20} step={0.1} onChange={(maxForce) => onChange({ maxForce })} />
      </section>

      <section>
        <h2>{t.boids}</h2>
        <Slider label={t.separation} value={settings.separationWeight} min={0} max={3.5} step={0.05} onChange={(separationWeight) => onChange({ separationWeight })} />
        <Slider label={t.alignment} value={settings.alignmentWeight} min={0} max={2.5} step={0.05} onChange={(alignmentWeight) => onChange({ alignmentWeight })} />
        <Slider label={t.cohesion} value={settings.cohesionWeight} min={0} max={2.5} step={0.05} onChange={(cohesionWeight) => onChange({ cohesionWeight })} />
      </section>

      <section>
        <h2>{t.predator}</h2>
        <Slider label={t.predatorRadius3d} value={settings.predatorRadius} min={1} max={7} step={0.1} onChange={(predatorRadius) => onChange({ predatorRadius })} />
        <Slider label={t.predatorBodyRadius} value={settings.predatorBodyRadius} min={0.25} max={2.2} step={0.05} onChange={(predatorBodyRadius) => onChange({ predatorBodyRadius })} />
        <Slider label={t.predatorStrength3d} value={settings.predatorStrength} min={2} max={28} step={0.2} onChange={(predatorStrength) => onChange({ predatorStrength })} />
        <Slider label={t.predatorSurfacePush} value={settings.predatorSurfacePush} min={1} max={22} step={0.2} onChange={(predatorSurfacePush) => onChange({ predatorSurfacePush })} />
        <Slider label={t.predatorCount3d} value={settings.predatorCount} min={1} max={8} step={1} onChange={(predatorCount) => onChange({ predatorCount })} />
        <label className="select-row">
          <span>{t.predatorStrategy3d}</span>
          <select
            value={settings.predatorStrategy}
            onChange={(event) => onChange({ predatorStrategy: event.target.value as PredatorStrategy3D })}
          >
            <option value="orcaCarousel">{t.orcaCarousel}</option>
            <option value="dolphinDrive">{t.dolphinDrive}</option>
            <option value="sharkStrike">{t.sharkStrike}</option>
            <option value="sealAmbush">{t.sealAmbush}</option>
          </select>
        </label>
        <label className="color-row">
          <span>{t.predatorColor3d}</span>
          <input
            type="color"
            value={settings.predatorColor}
            onChange={(event) => onChange({ predatorColor: event.target.value })}
          />
        </label>
        <Slider label={t.predatorAutoSpeed} value={settings.predatorAutoSpeed} min={1.5} max={12} step={0.1} onChange={(predatorAutoSpeed) => onChange({ predatorAutoSpeed })} />
        <Slider label={t.predatorSprintChance} value={settings.predatorSprintChance} min={0} max={1} step={0.01} onChange={(predatorSprintChance) => onChange({ predatorSprintChance })} />
        <Slider label={t.predatorSprintMultiplier} value={settings.predatorSprintMultiplier} min={1} max={5} step={0.05} onChange={(predatorSprintMultiplier) => onChange({ predatorSprintMultiplier })} />
        <Slider label={t.predatorSprintDuration} value={settings.predatorSprintDuration} min={0.2} max={2.5} step={0.05} onChange={(predatorSprintDuration) => onChange({ predatorSprintDuration })} />
        <Slider label={t.predatorSprintCooldown} value={settings.predatorSprintCooldown} min={0.2} max={8} step={0.1} onChange={(predatorSprintCooldown) => onChange({ predatorSprintCooldown })} />
        <Slider label={t.predatorChaseSpread} value={settings.predatorChaseSpread} min={1.5} max={12} step={0.1} onChange={(predatorChaseSpread) => onChange({ predatorChaseSpread })} />
        <Slider label={t.followSpeed} value={settings.predatorFollowSpeed} min={2} max={18} step={0.2} onChange={(predatorFollowSpeed) => onChange({ predatorFollowSpeed })} />
        <Checkbox label={t.showPredatorSphere} checked={settings.showPredatorSphere} onChange={(showPredatorSphere) => onChange({ showPredatorSphere })} />
      </section>

      <section>
        <h2>{t.camera}</h2>
        <Slider label={t.cameraDistance} value={settings.cameraDistance} min={50} max={110} step={0.5} onChange={(cameraDistance) => onChange({ cameraDistance })} />
        <div className="button-row">
          <button type="button" onClick={onResetCamera}>{t.resetCamera}</button>
          <button type="button" onClick={() => onChange({ showTankBounds: !settings.showTankBounds })}>
            {settings.showTankBounds ? t.hideBounds : t.showBounds}
          </button>
        </div>
      </section>

      <details>
        <summary>{t.advanced}</summary>
        <section>
          <h2>{t.abilities}</h2>
          <Checkbox label={t.blackHole3dEnabled} checked={settings.blackHoleEnabled} onChange={(blackHoleEnabled) => onChange({ blackHoleEnabled })} />
          <Slider label={t.blackHoleRadius} value={settings.blackHoleRadius} min={1} max={9} step={0.1} onChange={(blackHoleRadius) => onChange({ blackHoleRadius })} />
          <Slider label={t.blackHolePullStrength} value={settings.blackHolePullStrength} min={2} max={32} step={0.2} onChange={(blackHolePullStrength) => onChange({ blackHolePullStrength })} />
          <Checkbox label={t.scatter3dEnabled} checked={settings.scatterEnabled} onChange={(scatterEnabled) => onChange({ scatterEnabled })} />
          <Slider label={t.scatterRadius} value={settings.scatterRadius} min={1} max={10} step={0.1} onChange={(scatterRadius) => onChange({ scatterRadius })} />
          <Slider label={t.scatterStrength} value={settings.scatterStrength} min={2} max={30} step={0.2} onChange={(scatterStrength) => onChange({ scatterStrength })} />
          <Checkbox label={t.decoy3dEnabled} checked={settings.decoyEnabled} onChange={(decoyEnabled) => onChange({ decoyEnabled })} />
          <Slider label={t.decoyRadius} value={settings.decoyRadius} min={1} max={9} step={0.1} onChange={(decoyRadius) => onChange({ decoyRadius })} />
          <Slider label={t.decoyStrength} value={settings.decoyStrength} min={2} max={24} step={0.2} onChange={(decoyStrength) => onChange({ decoyStrength })} />
          <Slider label={t.decoyLifetime} value={settings.decoyLifetime} min={1} max={18} step={0.5} onChange={(decoyLifetime) => onChange({ decoyLifetime })} />
        </section>
        <section>
          <h2>{t.debug}</h2>
        <Checkbox label={t.mouseRay} checked={settings.showMouseRay} onChange={(showMouseRay) => onChange({ showMouseRay })} />
        <Checkbox label={t.autoDepthFish} checked={settings.showAutoDepthFish} onChange={(showAutoDepthFish) => onChange({ showAutoDepthFish })} />
        <Checkbox label={t.targetPoint} checked={settings.showTargetPoint} onChange={(showTargetPoint) => onChange({ showTargetPoint })} />
        <Checkbox label={t.schoolCenter} checked={settings.showSchoolCenter} onChange={(showSchoolCenter) => onChange({ showSchoolCenter })} />
        <Checkbox label={t.cameraSafety} checked={settings.showCameraSafety} onChange={(showCameraSafety) => onChange({ showCameraSafety })} />
        </section>
      </details>
    </aside>
  );
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <label className="slider-row">
      <span>
        {label}
        <strong>{Number.isInteger(value) ? value : value.toFixed(2)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="check-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
