import type { FishSpecies, SchoolMode, SimulationSettings } from '../simulation/types';
import { difficultyPresets } from '../simulation/settings';
import type { Language } from '../i18n';
import { copy } from '../i18n';

type ControlPanelProps = {
  settings: SimulationSettings;
  paused: boolean;
  language: Language;
  customPresets: CustomPresetSlot[];
  onChange: (patch: Partial<SimulationSettings>) => void;
  onSaveCustomPreset: (slot: number) => void;
  onLoadCustomPreset: (slot: number) => void;
  onDeleteCustomPreset: (slot: number) => void;
  onPauseChange: (paused: boolean) => void;
  onReset: () => void;
  onClose: () => void;
};

type CustomPresetSlot = {
  settings: SimulationSettings;
  savedAt: number;
} | null;

export function ControlPanel({
  settings,
  paused,
  language,
  customPresets,
  onChange,
  onSaveCustomPreset,
  onLoadCustomPreset,
  onDeleteCustomPreset,
  onPauseChange,
  onReset,
  onClose,
}: ControlPanelProps) {
  const t = copy[language];

  return (
    <aside className="control-panel">
      <div className="panel-title-row">
        <strong>{t.controls}</strong>
        <button type="button" onClick={onClose}>×</button>
      </div>
      <section>
        <h2>{t.basic}</h2>
        <Slider
          label={t.fishCount}
          value={settings.fishCount}
          min={20}
          max={1500}
          step={1}
          onChange={(fishCount) => onChange({ fishCount })}
        />
        <label className="select-row">
          <span>{t.difficulty}</span>
          <select
            value={settings.difficulty}
            onChange={(event) => {
              const difficulty = event.target.value as keyof typeof difficultyPresets;
              onChange(difficultyPresets[difficulty]);
            }}
          >
            <option value="easy">{t.easy}</option>
            <option value="normal">{t.normal}</option>
            <option value="hard">{t.hard}</option>
          </select>
        </label>
        <label className="select-row">
          <span>{t.fishSpecies}</span>
          <select
            value={settings.fishSpecies}
            onChange={(event) => onChange({ fishSpecies: event.target.value as FishSpecies })}
          >
            <option value="sardine">{t.sardine}</option>
            <option value="jackfish">{t.jackfish}</option>
            <option value="herring">{t.herring}</option>
          </select>
        </label>
        <label className="select-row">
          <span>{t.schoolMode}</span>
          <select
            value={settings.schoolMode}
            onChange={(event) => onChange({ schoolMode: event.target.value as SchoolMode })}
          >
            <option value="auto">{t.auto}</option>
            <option value="free">{t.free}</option>
            <option value="centerOrbit">{t.centerOrbit}</option>
            <option value="tankLoop">{t.tankLoop}</option>
          </select>
        </label>
        <div className="button-row">
          <button type="button" onClick={() => onPauseChange(!paused)}>
            {paused ? t.resume : t.pause}
          </button>
          <button type="button" onClick={onReset}>
            {t.reset}
          </button>
        </div>
      </section>

      <section>
        <h2>{t.customPresets}</h2>
        {customPresets.map((preset, index) => (
          <div className="preset-row" key={index}>
            <span>
              {t.customSlot} {index + 1}
              <small>{preset ? formatSavedAt(preset.savedAt) : t.emptySlot}</small>
            </span>
            <button type="button" onClick={() => onSaveCustomPreset(index)}>
              {t.saveSlot}
            </button>
            <button type="button" disabled={!preset} onClick={() => onLoadCustomPreset(index)}>
              {t.loadSlot}
            </button>
            <button type="button" disabled={!preset} onClick={() => onDeleteCustomPreset(index)}>
              {t.deleteSlot}
            </button>
          </div>
        ))}
      </section>

      <section>
        <h2>{t.movement}</h2>
        <Slider
          label={t.speed}
          value={settings.speed}
          min={25}
          max={130}
          step={1}
          onChange={(speed) => onChange({ speed })}
        />
        <Slider
          label={t.maxForce}
          value={settings.maxForce}
          min={55}
          max={440}
          step={1}
          onChange={(maxForce) => onChange({ maxForce })}
        />
      </section>

      <section>
        <h2>{t.boids}</h2>
        <Slider
          label={t.separation}
          value={settings.separationWeight}
          min={0}
          max={3}
          step={0.05}
          onChange={(separationWeight) => onChange({ separationWeight })}
        />
        <Slider
          label={t.alignment}
          value={settings.alignmentWeight}
          min={0}
          max={2.5}
          step={0.05}
          onChange={(alignmentWeight) => onChange({ alignmentWeight })}
        />
        <Slider
          label={t.cohesion}
          value={settings.cohesionWeight}
          min={0}
          max={2.5}
          step={0.05}
          onChange={(cohesionWeight) => onChange({ cohesionWeight })}
        />
      </section>

      <section>
        <h2>{t.predator}</h2>
        <Slider
          label={t.senseRadius}
          value={settings.predatorRadius}
          min={30}
          max={300}
          step={1}
          onChange={(predatorRadius) => onChange({ predatorRadius })}
        />
        <Slider
          label={t.avoidStrength}
          value={settings.predatorStrength}
          min={40}
          max={900}
          step={1}
          onChange={(predatorStrength) => onChange({ predatorStrength })}
        />
        <Slider
          label={t.biteRadius}
          value={settings.biteRadius}
          min={8}
          max={70}
          step={1}
          onChange={(biteRadius) => onChange({ biteRadius })}
        />
        <Slider
          label={t.killSpeedThreshold}
          value={settings.biteKillSpeedThreshold}
          min={25}
          max={150}
          step={1}
          onChange={(biteKillSpeedThreshold) => onChange({ biteKillSpeedThreshold })}
        />
        <Slider
          label={t.killCompanionThreshold}
          value={settings.biteKillCompanionThreshold}
          min={0}
          max={24}
          step={1}
          onChange={(biteKillCompanionThreshold) => onChange({ biteKillCompanionThreshold })}
        />
        <Checkbox
          label={t.showSenseRadius}
          checked={settings.showPredatorRadius}
          onChange={(showPredatorRadius) => onChange({ showPredatorRadius })}
        />
        <Checkbox
          label={t.showBiteRadius}
          checked={settings.showBiteRadius}
          onChange={(showBiteRadius) => onChange({ showBiteRadius })}
        />
      </section>

      <section>
        <h2>{t.penalties}</h2>
        <Checkbox
          label={t.penaltyEnabled}
          checked={settings.penaltyEnabled}
          onChange={(penaltyEnabled) => onChange({ penaltyEnabled })}
        />
        <Slider
          label={t.penaltyContactRadius}
          value={settings.penaltyContactRadius}
          min={8}
          max={44}
          step={1}
          onChange={(penaltyContactRadius) => onChange({ penaltyContactRadius })}
        />
        <Slider
          label={t.penaltyContactCount}
          value={settings.penaltyContactCount}
          min={1}
          max={24}
          step={1}
          onChange={(penaltyContactCount) => onChange({ penaltyContactCount })}
        />
        <Slider
          label={t.penaltyCost}
          value={settings.penaltyCost}
          min={0}
          max={40}
          step={1}
          onChange={(penaltyCost) => onChange({ penaltyCost })}
        />
        <Slider
          label={t.penaltySpeedThreshold}
          value={settings.penaltySpeedThreshold}
          min={300}
          max={2200}
          step={10}
          onChange={(penaltySpeedThreshold) => onChange({ penaltySpeedThreshold })}
        />
        <Slider
          label={t.penaltyDwellSeconds}
          value={settings.penaltyDwellSeconds}
          min={0.3}
          max={4}
          step={0.05}
          onChange={(penaltyDwellSeconds) => onChange({ penaltyDwellSeconds })}
        />
      </section>

      <section>
        <h2>{t.abilities}</h2>
        <Checkbox
          label={t.blackHoleEnabled}
          checked={settings.blackHoleEnabled}
          onChange={(blackHoleEnabled) => onChange({ blackHoleEnabled })}
        />
        <Slider
          label={t.blackHoleRadius}
          value={settings.blackHoleRadius}
          min={30}
          max={220}
          step={1}
          onChange={(blackHoleRadius) => onChange({ blackHoleRadius })}
        />
        <Slider
          label={t.blackHolePullStrength}
          value={settings.blackHolePullStrength}
          min={80}
          max={1800}
          step={10}
          onChange={(blackHolePullStrength) => onChange({ blackHolePullStrength })}
        />
        <Slider
          label={t.blackHoleKillRadius}
          value={settings.blackHoleKillRadius}
          min={6}
          max={60}
          step={1}
          onChange={(blackHoleKillRadius) => onChange({ blackHoleKillRadius })}
        />
        <Checkbox
          label={t.scatterEnabled}
          checked={settings.scatterEnabled}
          onChange={(scatterEnabled) => onChange({ scatterEnabled })}
        />
        <Slider
          label={t.scatterRadius}
          value={settings.scatterRadius}
          min={40}
          max={300}
          step={1}
          onChange={(scatterRadius) => onChange({ scatterRadius })}
        />
        <Slider
          label={t.scatterStrength}
          value={settings.scatterStrength}
          min={60}
          max={900}
          step={10}
          onChange={(scatterStrength) => onChange({ scatterStrength })}
        />
        <Checkbox
          label={t.decoyEnabled}
          checked={settings.decoyEnabled}
          onChange={(decoyEnabled) => onChange({ decoyEnabled })}
        />
        <Slider
          label={t.decoyRadius}
          value={settings.decoyRadius}
          min={40}
          max={320}
          step={1}
          onChange={(decoyRadius) => onChange({ decoyRadius })}
        />
        <Slider
          label={t.decoyStrength}
          value={settings.decoyStrength}
          min={60}
          max={1000}
          step={10}
          onChange={(decoyStrength) => onChange({ decoyStrength })}
        />
        <Slider
          label={t.decoyLifetime}
          value={settings.decoyLifetime}
          min={1}
          max={25}
          step={0.5}
          onChange={(decoyLifetime) => onChange({ decoyLifetime })}
        />
      </section>

      <details>
        <summary>{t.advanced}</summary>
        <Slider
          label={t.separationRadius}
          value={settings.separationRadius}
          min={8}
          max={40}
          step={1}
          onChange={(separationRadius) => onChange({ separationRadius })}
        />
        <Slider
          label={t.alignmentRadius}
          value={settings.alignmentRadius}
          min={20}
          max={90}
          step={1}
          onChange={(alignmentRadius) => onChange({ alignmentRadius })}
        />
        <Slider
          label={t.cohesionRadius}
          value={settings.cohesionRadius}
          min={35}
          max={150}
          step={1}
          onChange={(cohesionRadius) => onChange({ cohesionRadius })}
        />
        <Checkbox
          label={t.velocityVectors}
          checked={settings.showVelocityVectors}
          onChange={(showVelocityVectors) => onChange({ showVelocityVectors })}
        />
        <Checkbox
          label={t.showFps}
          checked={settings.showFps}
          onChange={(showFps) => onChange({ showFps })}
        />
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
        <strong>{formatValue(value)}</strong>
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

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatSavedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
