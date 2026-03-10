
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
  const [lbmaPrice, setLbmaPrice] = useState<number | null>(null);
  const t = locales[lang];

  useEffect(() => {
    if (isMenuOpen || isManagerPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, isManagerPopupOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchLbmaPrice = async () => {
      try {
        const response = await fetch('https://api.gold-api.com/price/XAU');
        if (!response.ok) return;
        const payload = await response.json();
        const price = Number(payload?.price);
        if (isMounted && Number.isFinite(price) && price > 0) {
          setLbmaPrice(price);
        }
      } catch {
        // keep previous value
      }
    };
    fetchLbmaPrice();
    const timer = window.setInterval(fetchLbmaPrice, 60000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const resolveLocalBase = (port: number) => {
    const host = window.location.hostname;
    const isLocalLike =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
    return isLocalLike ? `http://${host}:${port}` : null;
  };

  const handleNav = (view: string) => {
    setIsMenuOpen(false);
    if (view === 'dashboard' || view === 'profile') {
      // Ð•ÑÐ»Ð¸ ÑƒÐ¶Ðµ Ð² Dashboard app, Ð¿Ñ€Ð¾ÑÑ‚Ð¾ Ð¿ÐµÑ€ÐµÐºÐ»ÑŽÑ‡Ð°ÐµÐ¼ Ð²ÐºÐ»Ð°Ð´ÐºÑƒ
      if (onNavigate) onNavigate(view);
    } else {
      if (onNavigate) onNavigate(view);
    }
  };
  
  const openDashboard = () => {
    setIsMenuOpen(false);
    if (onNavigate) {
      onNavigate('dashboard');
      return;
    }
    const dashboardUrl = resolveLocalBase(3000) || 'https://dashboard.ipg-invest.ae';
    window.location.href = dashboardUrl;
  };

  const openInfoApp = (view: 'project' | 'company') => {
    const base = resolveLocalBase(3003) || 'https://info.ipg-invest.ae';
    const url = new URL(base);
    url.searchParams.set('view', view);
    url.searchParams.set('lang', lang);
    setIsMenuOpen(false);
    window.location.href = url.toString();
  };

  const openCalculator = () => {
    const base = resolveLocalBase(5178) || 'https://calculator.ipg-invest.ae';
    setIsMenuOpen(false);
    window.location.href = base;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[110]">
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

          <div className="w-full max-w-lg flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="font-['Playfair_Display'] font-black text-xs uppercase tracking-[0.15em] text-[#d4af37] leading-tight">Imperial</span>
              <span className="font-['Playfair_Display'] font-black text-xs uppercase tracking-[0.15em] text-black leading-tight">Pure Gold</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl border border-black/10 bg-black/[0.03] flex items-center gap-2">
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#d4af37]">LBMA</span>
              <span className="text-[11px] font-black text-black">{lbmaPrice ? `$${Math.round(lbmaPrice).toLocaleString()}` : '...'}</span>
            </div>
          </div>
          
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
                {lang === 'ru' ? 'Свяжитесь с нами' : 'Contact Us'}
              </h3>
              <p className="text-[10px] md:text-[11px] font-black text-[#d4af37] uppercase tracking-[0.3em]">
                {lang === 'ru' ? 'Контакты проекта и менеджера' : 'Project and manager contacts'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                {lang === 'ru' ? 'Контакты проекта' : 'Project contacts'}
              </div>
              <div className="grid grid-cols-2 rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                <a 
                  href="https://t.me/GoldenShareClub" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-4 border-r border-white/10 hover:bg-white/10 transition-all"
                >
                  <i className="fa-brands fa-telegram text-xl text-blue-400"></i>
                  <span className="text-white font-black text-sm">{lang === 'ru' ? 'Telegram' : 'Telegram'}</span>
                </a>
                <a 
                  href="https://www.facebook.com/share/1Dox5wK2MT/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-4 hover:bg-white/10 transition-all"
                >
                  <i className="fa-brands fa-facebook-f text-xl text-[#1877f2]"></i>
                  <span className="text-white font-black text-sm">Facebook</span>
                </a>
              </div>
              <div className="pt-2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                {lang === 'ru' ? 'Ваш Персональный Менеджер' : 'Your Personal Manager'}
              </div>
              <div className="grid grid-cols-2 rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                <a 
                  href="https://t.me/IPG_Mark" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-4 border-r border-white/10 hover:bg-white/10 transition-all"
                >
                  <i className="fa-brands fa-telegram text-xl text-blue-400"></i>
                  <span className="text-white font-black text-sm">Telegram</span>
                </a>
                <a 
                  href="https://api.whatsapp.com/send/?phone=447776177435&text&type=phone_number&app_absent=0" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-4 hover:bg-white/10 transition-all"
                >
                  <i className="fa-brands fa-whatsapp text-xl text-green-500"></i>
                  <span className="text-white font-black text-sm">WhatsApp</span>
                </a>
              </div>
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

