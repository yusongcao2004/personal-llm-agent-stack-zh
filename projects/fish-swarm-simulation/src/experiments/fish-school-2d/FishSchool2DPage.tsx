import { useCallback, useState } from 'react';
import { ControlPanel } from '../../components/ControlPanel';
import { FishCanvas } from '../../components/FishCanvas';
import { Header } from '../../components/Header';
import { RulesOverlay } from '../../components/RulesOverlay';
import type { Language } from '../../i18n';
import { copy } from '../../i18n';
import { defaultSettings } from '../../simulation/settings';
import type { SimulationSettings } from '../../simulation/types';

const CUSTOM_PRESETS_KEY = 'fish-school-foundation.custom-presets.v1';
const CUSTOM_PRESET_COUNT = 3;

export type CustomPresetSlot = {
  settings: SimulationSettings;
  savedAt: number;
} | null;

type FishSchool2DPageProps = {
  onNavigate3D: () => void;
};

export function FishSchool2DPage({ onNavigate3D }: FishSchool2DPageProps) {
  const [settings, setSettings] = useState<SimulationSettings>(defaultSettings);
  const [paused, setPaused] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [customPresets, setCustomPresets] = useState<CustomPresetSlot[]>(loadCustomPresets);
  const [resetSeed, setResetSeed] = useState(1);
  const [fps, setFps] = useState(60);
  const [activeFishCount, setActiveFishCount] = useState(defaultSettings.fishCount);
  const t = copy[language];

  const updateSettings = useCallback((patch: Partial<SimulationSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const saveCustomPreset = useCallback((slot: number) => {
    setCustomPresets((current) => {
      const next = normalizePresetSlots(current);
      next[slot] = {
        settings,
        savedAt: Date.now(),
      };
      persistCustomPresets(next);
      return next;
    });
  }, [settings]);

  const loadCustomPreset = useCallback((slot: number) => {
    const preset = customPresets[slot];
    if (preset) {
      setSettings(preset.settings);
    }
  }, [customPresets]);

  const deleteCustomPreset = useCallback((slot: number) => {
    setCustomPresets((current) => {
      const next = normalizePresetSlots(current);
      next[slot] = null;
      persistCustomPresets(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setResetSeed((seed) => seed + 1);
  }, []);

  const completed = activeFishCount === 0;

  return (
    <main className="app-shell">
      <Header
        fishCount={activeFishCount}
        fps={fps}
        showFps={settings.showFps}
        language={language}
        controlsOpen={controlsOpen}
        onToggleControls={() => setControlsOpen((value) => !value)}
        onShowRules={() => setRulesOpen(true)}
        onLanguageChange={setLanguage}
        onNavigate3D={onNavigate3D}
      />
      <section className="lab-layout">
        <FishCanvas
          settings={settings}
          paused={paused || rulesOpen || completed}
          resetSeed={resetSeed}
          onFpsChange={setFps}
          onFishCountChange={setActiveFishCount}
          language={language}
        />
        {controlsOpen ? (
          <ControlPanel
            settings={settings}
            paused={paused}
            language={language}
            customPresets={customPresets}
            onChange={updateSettings}
            onSaveCustomPreset={saveCustomPreset}
            onLoadCustomPreset={loadCustomPreset}
            onDeleteCustomPreset={deleteCustomPreset}
            onPauseChange={setPaused}
            onReset={reset}
            onClose={() => setControlsOpen(false)}
          />
        ) : null}
      </section>
      {rulesOpen ? (
        <RulesOverlay
          language={language}
          onLanguageChange={setLanguage}
          onClose={() => setRulesOpen(false)}
        />
      ) : null}
      {completed ? (
        <section className="complete-banner">
          <div>
            <p className="eyebrow">{t.tankCleared}</p>
            <h2>{t.allConsumed}</h2>
            <p>{t.resetTankHint}</p>
            <button type="button" onClick={reset}>{t.resetTank}</button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function loadCustomPresets(): CustomPresetSlot[] {
  if (typeof window === 'undefined') {
    return normalizePresetSlots([]);
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) {
      return normalizePresetSlots([]);
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return normalizePresetSlots([]);
    }
    return normalizePresetSlots(parsed);
  } catch {
    return normalizePresetSlots([]);
  }
}

function persistCustomPresets(slots: CustomPresetSlot[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(normalizePresetSlots(slots)));
}

function normalizePresetSlots(slots: unknown[]): CustomPresetSlot[] {
  return Array.from({ length: CUSTOM_PRESET_COUNT }, (_, index) => {
    const slot = slots[index] as Partial<NonNullable<CustomPresetSlot>> | null | undefined;
    if (!slot?.settings) {
      return null;
    }
    const savedAt = typeof slot.savedAt === 'number' && Number.isFinite(slot.savedAt)
      ? slot.savedAt
      : Date.now();
    return {
      settings: { ...defaultSettings, ...slot.settings },
      savedAt,
    };
  });
}
