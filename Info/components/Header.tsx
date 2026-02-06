import React, { useState, useEffect } from 'react';
import { Gem, Menu, MessageCircle, Send, User, X } from 'lucide-react';
import { Language, Translation, ViewState } from '../types';

interface HeaderProps {
  t: Translation;
  lang: Language;
  setLang: (lang: Language) => void;
  setView: (view: ViewState) => void;
  currentView: ViewState;
}

const Header: React.FC<HeaderProps> = ({ t, lang, setLang, setView, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  
  const [currentPrice, setCurrentPrice] = useState(2780);
  const [yearlyGrowth, setYearlyGrowth] = useState(8.4);
  const [currencyRates, setCurrencyRates] = useState({ AED: '3.67', RUB: '91.42' });

  useEffect(() => {
    const METAL_PRICE_API_KEY = 'd74227f0722d7eb9cf7b1dd6ebc5cad6';
    const CACHE_KEY = 'imperial_gold_price_data_v4';
    const CACHE_EXPIRY = 1000 * 60 * 60;

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

        const response = await fetch(
          `https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,AED,RUB`
        );
        const result = await response.json();
        if (result.success && result.rates) {
          const goldPricePerOunce = 1 / result.rates.XAU;
          const livePrice = Math.round(goldPricePerOunce || 2780);
          const newRates = {
            AED: Number(result.rates.AED.toFixed(2)) || 3.67,
            RUB: Number(result.rates.RUB.toFixed(2)) || 91.42
          };
          applyPrice(livePrice, newRates);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), lastPrice: livePrice, rates: newRates })
          );
        }
      } catch (err) {
        // keep defaults on error
      }
    };

    fetchPrices();
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen || isManagerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, isManagerModalOpen]);

  const handleNavClick = (view: ViewState) => {
    setView(view);
    setIsMenuOpen(false);
  };

  const buildAppUrl = (app: 'dashboard' | 'wallet' | 'invest' | 'info') => {
    const isLocal = window.location.hostname === 'localhost';
    if (isLocal) {
      const ports: Record<typeof app, number> = {
        dashboard: 3002,
        wallet: 3004,
        invest: 5183,
        info: 3003
      };
      return `http://localhost:${ports[app]}`;
    }

    // Production: поддомены
    const subdomains: Record<typeof app, string> = {
      dashboard: 'dashboard.ipg-invest.ae',
      wallet: 'wallet.ipg-invest.ae',
      invest: 'ipg-invest.ae',
      info: 'info.ipg-invest.ae'
    };
    
    return `https://${subdomains[app]}`;
  };

  const openApp = (app: 'dashboard' | 'wallet' | 'invest') => {
    setIsMenuOpen(false);
    window.location.href = buildAppUrl(app);
  };

  const openCalculator = () => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5183' : 'https://ipg-invest.ae';
    setIsMenuOpen(false);
    window.location.href = `${base}?view=calculator`;
  };

  return (
    <>
      {/* 1. Top Marquee */}
      <div className="fixed top-0 w-full z-[100] bg-[#141417]/95 border-b border-white/5 h-10 flex items-center overflow-hidden backdrop-blur-2xl">
        <div className="flex animate-marquee whitespace-nowrap min-w-full">
          {/* Content duplicated for seamless loop */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center shrink-0">
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
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Header */}
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
            <button 
              onClick={() => setLang('RU')} 
              className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'RU' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}
            >
              RU
            </button>
            <button 
              onClick={() => setLang('EN')} 
              className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'EN' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}
            >
              EN
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 group/hub">
            <div className={`flex items-center gap-2 transition-all duration-500 overflow-hidden ${isContactExpanded ? 'max-w-[150px] md:max-w-[200px] opacity-100 pr-2' : 'max-w-0 opacity-0'}`}>
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex-shrink-0">
                <Send size={16} />
              </a>
              <button onClick={() => setIsManagerModalOpen(true)} className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:text-[#d4af37] transition-all flex-shrink-0">
                <User size={16} />
              </button>
            </div>
            <button 
              onClick={() => setIsContactExpanded(!isContactExpanded)} 
              className={`flex items-center justify-center px-4 md:px-6 h-9 md:h-10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${isContactExpanded ? 'bg-white/10 text-white' : 'text-[#d4af37]'}`}
            >
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

            <button onClick={() => handleNavClick('company')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">
                {t.menuCompany}
              </span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>

            <button onClick={() => handleNavClick('project')} className="group flex flex-col items-center gap-2">
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

      {/* Manager Modal */}
      {isManagerModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsManagerModalOpen(false)}
          ></div>
          <div className="relative glass-card p-8 md:p-12 rounded-[3rem] w-full max-sm:mx-4 max-w-sm border-[#d4af37]/20 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsManagerModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
            <div className="w-16 h-16 md:w-20 md:h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              <User className="text-black" size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-playfair font-black text-white text-center mb-4">
              {t.managerTitle}
            </h3>
            <p className="text-white/40 text-center text-sm md:text-base mb-10 font-medium mx-auto max-w-[220px]">
              {t.managerDesc}
            </p>
            <div className="flex flex-col gap-4 w-full">
              <a
                href="https://t.me/manager_username"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform">
                  <Send size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg">Telegram</span>
                  <span className="text-white/30 text-xs font-bold uppercase tracking-widest">
                    {t.managerTelegramSub}
                  </span>
                </div>
              </a>
              <a
                href="https://wa.me/971529657370"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-green-500/40 hover:bg-white/[0.08] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg">WhatsApp</span>
                  <span className="text-white/30 text-xs font-bold uppercase tracking-widest">
                    {t.managerWhatsappSub}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;