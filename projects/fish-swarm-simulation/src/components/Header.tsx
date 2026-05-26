import type { Language } from '../i18n';
import { copy } from '../i18n';

type HeaderProps = {
  fishCount: number;
  fps: number;
  showFps: boolean;
  language: Language;
  controlsOpen: boolean;
  onToggleControls: () => void;
  onShowRules: () => void;
  onLanguageChange: (language: Language) => void;
  onNavigate3D: () => void;
};

export function Header({
  fishCount,
  fps,
  showFps,
  language,
  controlsOpen,
  onToggleControls,
  onShowRules,
  onLanguageChange,
  onNavigate3D,
}: HeaderProps) {
  const t = copy[language];

  return (
    <header className="top-bar">
      <div>
        <p className="eyebrow">{t.subtitle}</p>
        <h1>{t.title}</h1>
      </div>
      <div className="top-stats">
        <span>{t.fish}: {fishCount}</span>
        {showFps ? <span>{fps} {t.fps}</span> : null}
        <button type="button" onClick={onToggleControls}>
          {controlsOpen ? t.hideControls : t.controls}
        </button>
        <button type="button" onClick={onShowRules}>
          {t.rules}
        </button>
        <button type="button" onClick={onNavigate3D}>
          3D Tank
        </button>
        <label className="language-select" aria-label={t.languageLabel}>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="de">Deutsch</option>
          </select>
        </label>
      </div>
    </header>
  );
}
