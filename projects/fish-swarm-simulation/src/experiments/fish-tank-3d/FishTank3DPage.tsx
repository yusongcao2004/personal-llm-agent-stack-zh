import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { ControlPanel3D } from './ControlPanel3D';
import { FishTankScene, type AbilityState3D, type CameraControls3D, type MouseControlState3D } from './FishTankScene';
import type { Language } from '../../i18n';
import { copy } from '../../i18n';
import { defaultSettings3D, getMinimumCameraDistance, tankBounds3D } from './simulation/settings3d';
import type { FishTankSettings3D } from './simulation/types';
import { clamp } from './simulation/vector3';

type FishTank3DPageProps = {
  onNavigate2D: () => void;
};

const defaultCamera: CameraControls3D = {
  yaw: 0.72,
  pitch: 0.24,
  distance: defaultSettings3D.cameraDistance,
};

export function FishTank3DPage({ onNavigate2D }: FishTank3DPageProps) {
  const [settings, setSettings] = useState<FishTankSettings3D>(defaultSettings3D);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [pointerLocked, setPointerLocked] = useState(false);
  const [resetSeed, setResetSeed] = useState(1);
  const [fps, setFps] = useState(60);
  const stageRef = useRef<HTMLElement | null>(null);
  const cameraControlsRef = useRef<CameraControls3D>({ ...defaultCamera });
  const mouseControlRef = useRef<MouseControlState3D>({ dx: 0, dy: 0, leftDown: false, leftPressed: false });
  const abilitiesRef = useRef<AbilityState3D>({ blackHole: false, scatterPulse: 0, decoyPulse: 0 });
  const t = copy[language];

  const updateSettings = useCallback((patch: Partial<FishTankSettings3D>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    cameraControlsRef.current.distance = settings.cameraDistance;
  }, [settings.cameraDistance]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        if (!event.repeat) {
          abilitiesRef.current.scatterPulse += 1;
        }
        event.preventDefault();
        return;
      }

      if (event.code === 'KeyF') {
        if (!event.repeat) {
          abilitiesRef.current.decoyPulse += 1;
        }
        event.preventDefault();
        return;
      }

      if (event.code === 'Escape') {
        setPointerLocked(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handlePointerLockChange = () => {
      const lockedElement = document.pointerLockElement;
      const stage = stageRef.current;
      const locked = !!lockedElement && !!stage && (lockedElement === stage || stage.contains(lockedElement));
      setPointerLocked(locked);
      if (!locked) {
        mouseControlRef.current.leftDown = false;
        mouseControlRef.current.leftPressed = false;
        abilitiesRef.current.blackHole = false;
      }
    };
    const handleMouseUp = () => {
      mouseControlRef.current.leftDown = false;
      abilitiesRef.current.blackHole = false;
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const resetCamera = useCallback(() => {
    cameraControlsRef.current = { ...defaultCamera };
    setSettings((current) => ({ ...current, cameraDistance: defaultCamera.distance }));
  }, []);

  const resetSimulation = useCallback(() => {
    setResetSeed((seed) => seed + 1);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!pointerLocked) {
      return;
    }
    mouseControlRef.current.dx += event.movementX;
    mouseControlRef.current.dy += event.movementY;
  }, [pointerLocked]);

  const handleWheel = useCallback((event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
    const minDistance = getMinimumCameraDistance(tankBounds3D);
    const nextDistance = clamp(cameraControlsRef.current.distance + event.deltaY * 0.018, minDistance, 110);
    cameraControlsRef.current.distance = nextDistance;
    setSettings((current) => ({ ...current, cameraDistance: nextDistance }));
  }, []);

  return (
    <main className="tank3d-shell">
      <header className="tank3d-topbar">
        <div>
          <p className="eyebrow">{t.tank3dSubtitle}</p>
          <h1>{t.tank3dTitle}</h1>
        </div>
        <div className="top-stats tank3d-stats">
          <span>{t.fish}: {settings.fishCount}</span>
          <span>{fps} {t.fps}</span>
          <span>{pointerLocked ? t.orbitingCamera : t.pause}</span>
          <span>{t.autoHunt3d}</span>
          <span>{t.predatorStrategy3d}: {t[settings.predatorStrategy]}</span>
          <button type="button" onClick={() => setControlsOpen((value) => !value)}>
            {controlsOpen ? t.hideControls : t.controls}
          </button>
          <button type="button" onClick={onNavigate2D}>{t.foundation2d}</button>
          <label className="language-select" aria-label={t.languageLabel}>
            <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="de">Deutsch</option>
            </select>
          </label>
        </div>
      </header>

      <section
        ref={stageRef}
        className="tank3d-stage"
        onPointerMoveCapture={handlePointerMove}
        onWheel={handleWheel}
        onClickCapture={(event) => {
          if (!rulesOpen && !pointerLocked) {
            const request = event.currentTarget.requestPointerLock();
            setPointerLocked(true);
            if (request) {
              request.catch(() => undefined);
            }
          }
        }}
        onPointerDownCapture={(event) => {
          if (!rulesOpen && document.pointerLockElement !== event.currentTarget) {
            const request = event.currentTarget.requestPointerLock();
            setPointerLocked(true);
            if (request) {
              request.catch(() => undefined);
            }
          }
          if (event.button === 0) {
            mouseControlRef.current.leftDown = true;
            mouseControlRef.current.leftPressed = true;
          }
          if (event.button === 2) {
            abilitiesRef.current.blackHole = true;
          }
        }}
        onPointerUpCapture={(event) => {
          if (event.button === 0) {
            mouseControlRef.current.leftDown = false;
          }
          if (event.button === 2) {
            abilitiesRef.current.blackHole = false;
          }
        }}
        onPointerCancelCapture={() => {
          abilitiesRef.current.blackHole = false;
          mouseControlRef.current.leftDown = false;
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <FishTankScene
          settings={{ ...settings, paused: settings.paused || rulesOpen || !pointerLocked }}
          resetSeed={resetSeed}
          pointerLocked={pointerLocked}
          cameraControlsRef={cameraControlsRef}
          mouseControlRef={mouseControlRef}
          abilitiesRef={abilitiesRef}
          onFpsChange={setFps}
        />
        {!pointerLocked && !rulesOpen ? (
          <button
            type="button"
            className="tank3d-lock-layer"
            aria-label={t.predatorHelp}
            onClick={(event) => {
              const request = event.currentTarget.requestPointerLock();
              setPointerLocked(true);
              if (request) {
                request.catch(() => undefined);
              }
            }}
          />
        ) : null}
        {pointerLocked ? <div className="tank3d-reticle" aria-hidden="true" /> : null}
      </section>

      <div className="tank3d-mode-card">
        <strong>{pointerLocked ? t.orbitingCamera : t.predatorControl}</strong>
        <span>
          {pointerLocked
            ? t.orbitHelp
            : t.predatorHelp}
        </span>
      </div>

      {rulesOpen ? (
        <RulesOverlay3D
          language={language}
          onLanguageChange={setLanguage}
          onClose={() => setRulesOpen(false)}
        />
      ) : null}

      {controlsOpen ? (
        <ControlPanel3D
          settings={settings}
          language={language}
          onChange={updateSettings}
          onReset={resetSimulation}
          onResetCamera={resetCamera}
          onClose={() => setControlsOpen(false)}
        />
      ) : null}
    </main>
  );
}

function RulesOverlay3D({
  language,
  onLanguageChange,
  onClose,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onClose: () => void;
}) {
  const t = copy[language];

  return (
    <section className="rules-overlay">
      <div className="rules-card">
        <p className="eyebrow">{t.tank3dSubtitle}</p>
        <h2>{t.tank3dRulesTitle}</h2>
        <div className="rules-language-row" aria-label={t.languageLabel}>
          <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => onLanguageChange('en')}>
            English
          </button>
          <button type="button" className={language === 'zh' ? 'active' : ''} onClick={() => onLanguageChange('zh')}>
            中文
          </button>
          <button type="button" className={language === 'de' ? 'active' : ''} onClick={() => onLanguageChange('de')}>
            Deutsch
          </button>
        </div>
        <p className="rules-lead">{t.tank3dRulesLead}</p>
        <ul>
          <li>{t.tank3dRuleKeyboard}</li>
          <li>{t.tank3dRuleCamera}</li>
          <li>{t.tank3dRuleSphere}</li>
          <li>{t.tank3dRuleSchool}</li>
        </ul>
        <button type="button" onClick={onClose}>{t.start}</button>
      </div>
    </section>
  );
}
