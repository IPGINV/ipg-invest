
import React, { useState, useEffect } from 'react';
import { locales } from '../locales';

interface HeaderProps {
  onLogout?: () => void;
  isLoggedIn: boolean;
  lang: 'en' | 'ru';
  setLang: (l: 'en' | 'ru') => void;
  onNavigate?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, isLoggedIn, lang, setLang, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isManagerPopupOpen, setIsManagerPopupOpen] = useState(false);
  const t = locales[lang];

  // Mock dynamic data for ticker
  const [currentPrice, setCurrentPrice] = useState(2780);
  const [yearlyGrowth, setYearlyGrowth] = useState(8.4);
  const [currencyRates, setCurrencyRates] = useState({ AED: '3.67', RUB: '91.42' });

  useEffect(() => {
    const CACHE_KEY = 'imperial_gold_price_data_v5';
    const CACHE_EXPIRY = 1000 * 60 * 60; // 1 час

    const applyPrice = (price: number, rates: { AED: number; RUB: number }) => {
      setCurrentPrice(price);
      setCurrencyRates({
        AED: rates.AED.toFixed(2),
        RUB: rates.RUB.toFixed(2)
      });
      const baseline = price * 0.92;
      const growth = ((price - baseline) / baseline) * 100;
      setYearlyGrowth(Number(growth.toFixed(1)));
    };

    const fetchPrices = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, rates, lastPrice } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            applyPrice(lastPrice, rates);
            return;
          }
        }

        // Используем публичный API для цен на металлы (бесплатный)
        const [metalResponse, currencyResponse] = await Promise.all([
          fetch('https://data-asg.goldprice.org/dbXRates/USD'),
          fetch('https://api.exchangerate-api.com/v4/latest/USD')
        ]);
        
        const metalData = await metalResponse.json();
        const currencyData = await currencyResponse.json();
        
        if (metalData && metalData.items && metalData.items.length > 0) {
          // Находим цену золота (XAU)
          const goldItem = metalData.items.find((item: any) => item.curr === 'XAU');
          if (goldItem) {
            const goldPricePerOunce = Math.round(goldItem.xauPrice || 2780);
            
            const newRates = {
              AED: Number(currencyData.rates?.AED?.toFixed(2)) || 3.67,
              RUB: Number(currencyData.rates?.RUB?.toFixed(2)) || 91.42
            };
            
            applyPrice(goldPricePerOunce, newRates);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), lastPrice: goldPricePerOunce, rates: newRates })
            );
          }
        }
      } catch (err) {
        console.error('Price fetch error:', err);
        // Используем актуальные дефолтные значения при ошибке
        applyPrice(2780, { AED: 3.67, RUB: 91.42 });
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    if (isMenuOpen || isManagerPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, isManagerPopupOpen]);

  const handleNav = (view: string) => {
    setIsMenuOpen(false);
    if (view === 'dashboard' || view === 'profile') {
      // Если уже в Dashboard app, просто переключаем вкладку
      if (onNavigate) onNavigate(view);
    } else {
      if (onNavigate) onNavigate(view);
    }
  };
  
  const openDashboard = () => {
    setIsMenuOpen(false);
    // Редирект на страницу входа в Dashboard
    const isLocal = window.location.hostname === 'localhost';
    const dashboardUrl = isLocal ? 'http://localhost:3002' : 'https://dashboard.ipg-invest.ae';
    window.location.href = dashboardUrl;
  };

  const openInfoApp = (view: 'project' | 'company') => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:3003' : 'https://info.ipg-invest.ae';
    const url = new URL(base);
    url.searchParams.set('view', view);
    url.searchParams.set('lang', lang);
    setIsMenuOpen(false);
    window.location.href = url.toString();
  };

  const openCalculator = () => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5183' : 'https://ipg-invest.ae';
    setIsMenuOpen(false);
    window.location.href = `${base}?view=calculator`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[110]">
        {/* Layer 1: Top Marquee (40px) */}
        <div className="bg-[#0c0c0e] border-b border-white/5 h-10 flex items-center overflow-hidden">
          <div className="ticker-content">
            {[1, 2].map((group) => (
              <div key={group} className="flex items-center">
                <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
                  <i className="fa-solid fa-gem text-[10px]"></i> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)
                </span>
                <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">{t.marqueeSpotAU}: ${currentPrice.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">USD/AED: {currencyRates.AED}</span>
                <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase">{t.marqueeInstLevel}</span>
                <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
                  <i className="fa-solid fa-gem text-[10px]"></i> {t.marqueeLivePhysical}
                </span>
                <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">USD/RUB: {currencyRates.RUB}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 2: Main Header (80px) */}
        <header className="bg-[#141417]/90 backdrop-blur-3xl border-b border-white/5 px-4 md:px-12 h-20 flex justify-between items-center">
          {/* Left: Burger + Brand */}
          <div className="flex items-center gap-3 md:gap-5 cursor-pointer group" onClick={() => setIsMenuOpen(true)}>
            <div className="flex items-center gap-2 md:gap-3 bg-white/5 p-1 pr-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
              <div className="w-10 h-10 md:w-11 md:h-11 gold-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <i className="fa-solid fa-bars-staggered text-black text-xl"></i>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-['Playfair_Display'] font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Imperial</span>
                <span className="font-['Playfair_Display'] font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Pure</span>
                <span className="font-['Playfair_Display'] font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Gold</span>
              </div>
            </div>
          </div>

          {/* Right: Lang Switcher + Contacts */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10">
              <button 
                onClick={() => setLang('ru')} 
                className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'ru' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}
              >
                RU
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 group/hub relative">
              <div className={`flex items-center gap-2 transition-all duration-500 overflow-hidden ${isContactExpanded ? 'max-w-[150px] md:max-w-[200px] opacity-100 pr-2' : 'max-w-0 opacity-0'}`}>
                <a href="https://t.me/GoldenShareClub" target="_blank" className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex-shrink-0">
                  <i className="fa-solid fa-paper-plane text-sm"></i>
                </a>
                <button 
                  onClick={() => setIsManagerPopupOpen(true)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:text-[#d4af37] transition-all flex-shrink-0"
                >
                  <i className="fa-solid fa-user-tie text-sm"></i>
                </button>
              </div>
              <button 
                onClick={() => setIsContactExpanded(!isContactExpanded)} 
                className={`flex items-center justify-center px-4 md:px-6 h-9 md:h-10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${isContactExpanded ? 'bg-white/10 text-white' : 'text-[#d4af37]'}`}
              >
                {isContactExpanded ? <i className="fa-solid fa-xmark text-sm"></i> : t.contactBtn}
              </button>
            </div>
            
            {isLoggedIn && (
               <button 
                onClick={onLogout}
                className="hidden md:block bg-white/5 text-white/40 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all border border-white/5"
              >
                {t.signOut}
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Full-Screen Menu Overlay - Light Version with Black Text */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white/98 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col items-center justify-start p-6 pt-[10vh]">
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="absolute top-10 right-10 p-3 bg-black/5 rounded-full border border-black/5 text-black/60 hover:text-[#d4af37] transition-all"
          >
            <i className="fa-solid fa-xmark text-3xl"></i>
          </button>
          
          <div className="flex flex-col gap-12 w-full max-w-lg text-center">
            <button onClick={openDashboard} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black group-hover:text-[#d4af37] transition-all">
                {t.dashboard}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>

            <button onClick={() => openInfoApp('company')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.company}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>

            <button onClick={() => openInfoApp('project')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.projectInfo}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>

            <button onClick={openCalculator} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.calculator}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>

            <div className="mt-[2vh] md:-mt-[8vh] pt-12 border-t border-black/10 flex flex-col gap-6">
              <a
                href="https://imperialpuregold.ae"
                target="_blank"
                rel="noreferrer"
                className="text-[#d4af37] font-black uppercase tracking-widest text-sm hover:text-black transition-colors"
              >
                {t.companySite}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Manager Contact Popup */}
      {isManagerPopupOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsManagerPopupOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#141417] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setIsManagerPopupOpen(false)} 
              className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <div className="mb-10 text-center">
              <div className="w-16 h-16 rounded-3xl gold-gradient flex items-center justify-center text-black mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <i className="fa-solid fa-user-tie text-2xl"></i>
              </div>
              <h3 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-white tracking-tight mb-2">
                {t.personalManager}
              </h3>
              <p className="text-[10px] md:text-[11px] font-black text-[#d4af37] uppercase tracking-[0.3em]">
                {t.prioritySupportHub}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a 
                href="https://t.me/IPG_Mark" 
                target="_blank" 
                className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all group shadow-inner"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <i className="fa-brands fa-telegram text-2xl"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg">Telegram</span>
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                    {t.chatWithSupport}
                  </span>
                </div>
              </a>

              <a 
                href="https://wa.me/447782280474" 
                target="_blank" 
                className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] hover:border-green-500/40 hover:bg-white/[0.08] transition-all group shadow-inner"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                  <i className="fa-brands fa-whatsapp text-2xl"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-lg">WhatsApp</span>
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                    {t.instantMessage}
                  </span>
                </div>
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center px-4">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                {t.managerAvailability}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
