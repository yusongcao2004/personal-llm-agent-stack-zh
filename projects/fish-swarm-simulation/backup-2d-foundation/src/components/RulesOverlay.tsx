import type { Language } from '../i18n';
import { copy } from '../i18n';

type RulesOverlayProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onClose: () => void;
};

export function RulesOverlay({ language, onLanguageChange, onClose }: RulesOverlayProps) {
  const t = copy[language];

  return (
    <section className="rules-overlay">
      <div className="rules-card">
        <p className="eyebrow">{t.subtitle}</p>
        <h2>{t.rulesTitle}</h2>
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
        <p className="rules-lead">{t.rulesLead}</p>
        <ul>
          <li>{t.ruleSense}</li>
          <li>{t.ruleBite}</li>
          <li>{t.ruleSchool}</li>
          <li>{t.rulePenalty}</li>
          <li>{t.ruleAbilities}</li>
          <li>{t.ruleDifficulty}</li>
          <li>{t.rulePanel}</li>
        </ul>
        <button type="button" onClick={onClose}>
          {t.start}
        </button>
      </div>
    </section>
  );
}
