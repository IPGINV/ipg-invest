import React, { useState } from 'react';
import { Gem, Menu, Send, User, X } from 'lucide-react';
import { Language, CurrencyRates } from '../types';
import { TRANSLATIONS } from '../constants';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  currencyRates: CurrencyRates;
  currentPrice: number;
  yearlyGrowth: number;
  onManagerClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  lang, 
  setLang, 
  currencyRates, 
  currentPrice, 
  yearlyGrowth,
  onManagerClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const t = TRANSLATIONS[lang];

  const buildAppUrl = (app: 'dashboard' | 'info' | 'invest' | 'wallet') => {
    const isLocal = window.location.hostname === 'localhost';
    if (isLocal) {
      const ports: Record<typeof app, number> = {
        dashboard: 5174,
        info: 5173,
        invest: 5176,
        wallet: 5175
      };
      return `http://localhost:${ports[app]}`;
    }

    const base = 'https://ipg-invest.ae';
    const paths: Record<typeof app, string> = {
      dashboard: '/dashboard',
      info: '/info',
      invest: '/',
      wallet: '/wallet'
    };
    return `${base}${paths[app]}`;
  };

  const openInfoView = (view: 'company' | 'project') => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5173' : 'https://ipg-invest.ae/info';
    const url = new URL(base);
    url.searchParams.set('view', view);
    setIsMenuOpen(false);
    window.location.href = url.toString();
  };

  const openApp = (app: 'dashboard' | 'info' | 'invest') => {
    setIsMenuOpen(false);
    window.location.href = buildAppUrl(app);
  };

  const openCalculator = () => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5178' : 'https://ipg-invest.ae/calculator';
    setIsMenuOpen(false);
    window.location.href = base;
  };

  return (
    <>
      {/* Top Marquee */}
      <div className="fixed top-0 w-full z-[100] bg-[#141417]/95 border-b border-white/5 h-10 flex items-center overflow-hidden backdrop-blur-2xl">
        <div className="marquee flex items-center whitespace-nowrap animate-marquee">
          <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
            <Gem size={10} /> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)
          </span>
          <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">
            {t.marqueeSpotAU}: ${currentPrice.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">
            USD/AED: {currencyRates.AED}
          </span>
          <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase">
            {t.marqueeInstLevel}
          </span>
          <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
            <Gem size={10} /> {t.marqueeLivePhysical}
          </span>
          <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">
            USD/RUB: {currencyRates.RUB}
          </span>
           {/* Duplicate for seamless loop effect (basic implementation) */}
           <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
            <Gem size={10} /> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="fixed top-10 w-full z-[90] bg-[#141417]/25 backdrop-blur-3xl border-b border-white/5 px-4 md:px-12 h-20 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3 md:gap-5 cursor-pointer group" onClick={() => setIsMenuOpen(true)}>
          <div className="flex items-center gap-2 md:gap-3 bg-white/5 p-1 pr-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
            <div className="w-10 h-10 md:w-11 md:h-11 gold-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Menu className="text-black" size={20} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-playfair font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Imperial</span>
              <span className="font-playfair font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Pure</span>
              <span className="font-playfair font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Gold</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10">
            <button onClick={() => setLang('RU')} className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'RU' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}>RU</button>
            <button onClick={() => setLang('EN')} className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'EN' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}>EN</button>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 group/hub">
            <div className={`flex items-center gap-2 transition-all duration-500 overflow-hidden ${isContactExpanded ? 'max-w-[150px] md:max-w-[200px] opacity-100 pr-2' : 'max-w-0 opacity-0'}`}>
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex-shrink-0">
                <Send size={16} />
              </a>
              <button onClick={onManagerClick} className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:text-[#d4af37] transition-all flex-shrink-0">
                <User size={16} />
              </button>
            </div>
            <button onClick={() => setIsContactExpanded(!isContactExpanded)} className={`flex items-center justify-center px-4 md:px-6 h-9 md:h-10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${isContactExpanded ? 'bg-white/10 text-white' : 'text-[#d4af37]'}`}>
              {isContactExpanded ? <X size={14} /> : t.contactBtn}
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white/98 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col items-center justify-start p-6 pt-[10vh]">
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="absolute top-10 right-10 p-3 bg-black/5 rounded-full border border-black/5 text-black/60 hover:text-[#d4af37] transition-all"
          >
            <X size={32} />
          </button>
          <div className="flex flex-col gap-10 w-full max-w-lg text-center">
            <button onClick={() => openApp('dashboard')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black group-hover:text-[#d4af37] transition-all">
                {t.menuDashboard}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <button onClick={() => openInfoView('company')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.menuCompany}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <button onClick={() => openInfoView('project')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.menuProject}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <button onClick={openCalculator} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.menuCalculator}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <div className="-mt-[8vh] pt-8 border-t border-black/10 flex flex-col gap-4">
              <a
                href="https://imperialpuregold.ae"
                target="_blank"
                rel="noreferrer"
                className="text-[#d4af37] font-black uppercase tracking-widest text-sm hover:text-black transition-colors"
              >
                {t.menuCompanySite}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
