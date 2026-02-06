import React from 'react';
import { locales } from '../locales';

type LandingProps = {
  lang: 'en' | 'ru';
  setLang: (lang: 'en' | 'ru') => void;
  onEnter: () => void;
};

const Landing: React.FC<LandingProps> = ({ lang, setLang, onEnter }) => {
  const t = locales[lang];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full text-center">
        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">
          {t.securityProtocol}
        </p>
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-['Playfair_Display'] font-black uppercase tracking-[0.12em] gold-text">
            {t.landingTitle}
          </h1>
          <p className="mt-4 text-white/60 text-xs md:text-sm font-medium leading-relaxed">
            {t.landingSubtitle}
          </p>
        </div>
        <button
          onClick={onEnter}
          className="gold-gradient text-black px-10 py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:shadow-xl active:scale-95 transition-all"
        >
          {t.enterDashboard}
        </button>
        <div className="mt-8 flex items-center justify-center space-x-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40">
          <button
            onClick={() => setLang('ru')}
            className={`transition-colors ${lang === 'ru' ? 'text-white' : 'hover:text-white'}`}
          >
            RU
          </button>
          <span className="text-white/20">/</span>
          <button
            onClick={() => setLang('en')}
            className={`transition-colors ${lang === 'en' ? 'text-white' : 'hover:text-white'}`}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
