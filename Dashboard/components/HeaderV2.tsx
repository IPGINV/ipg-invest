import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, Calculator, User, Menu, X, Building2, Info, Phone, Globe, Gem, Send, MessageCircle, LogOut, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { locales } from '../locales';
import { useHeaderVisibility } from '../context/HeaderVisibilityContext';

interface HeaderV2Props {
  onLogout?: () => void;
  isLoggedIn: boolean;
  lang: 'en' | 'ru';
  setLang: (l: 'en' | 'ru') => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  hideNavBar?: boolean;
}

const HeaderV2: React.FC<HeaderV2Props> = ({
  onLogout,
  isLoggedIn,
  lang,
  setLang,
  currentPage,
  onNavigate,
  hideNavBar = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isManagerPopupOpen, setIsManagerPopupOpen] = useState(false);
  const visibility = useHeaderVisibility();
  const headerVisible = visibility?.headerVisible ?? true;
  const setModalOverlay = visibility?.setModalOverlay;
  const t = locales[lang];

  const [currentPrice, setCurrentPrice] = useState(2780);
  const [yearlyGrowth, setYearlyGrowth] = useState(8.4);
  const [currencyRates, setCurrencyRates] = useState({ AED: '3.67', RUB: '91.42' });

  useEffect(() => {
    const CACHE_KEY = 'imperial_gold_price_data_v5';
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

        const currencyResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const currencyData = await currencyResponse.json();
        const goldPricePerOunce = 2780;
        const newRates = {
          AED: Number(currencyData.rates?.AED?.toFixed(2)) || 3.67,
          RUB: Number(currencyData.rates?.RUB?.toFixed(2)) || 91.42
        };
        applyPrice(goldPricePerOunce, newRates);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), lastPrice: goldPricePerOunce, rates: newRates })
        );
      } catch {
        applyPrice(2780, { AED: 3.67, RUB: 91.42 });
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    if (isMenuOpen || isProfileMenuOpen || isManagerPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isProfileMenuOpen, isManagerPopupOpen]);

  useEffect(() => {
    setModalOverlay?.('dashboard-header-menu', isMenuOpen);
    return () => setModalOverlay?.('dashboard-header-menu', false);
  }, [isMenuOpen, setModalOverlay]);

  useEffect(() => {
    setModalOverlay?.('dashboard-header-profile', isProfileMenuOpen);
    return () => setModalOverlay?.('dashboard-header-profile', false);
  }, [isProfileMenuOpen, setModalOverlay]);

  useEffect(() => {
    setModalOverlay?.('dashboard-header-manager', isManagerPopupOpen);
    return () => setModalOverlay?.('dashboard-header-manager', false);
  }, [isManagerPopupOpen, setModalOverlay]);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'calculator', label: t.calculator, icon: Calculator },
    { id: 'history', label: t.history, icon: History },
    { id: 'profile', label: t.profile, icon: User }
  ];

  const handleNav = (page: string) => {
    setIsMenuOpen(false);
    onNavigate(page);
  };

  const isLocalHost = () =>
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  const getInfoBase = () => (isLocalHost() ? 'http://localhost:3003' : 'https://info.ipg-invest.ae');
  const profileText = t.profileLabel ?? (lang === 'ru' ? 'Профиль' : 'Profile');

  const openProfileMenu = () => {
    setIsProfileMenuOpen(true);
  };

  const redirectToCompany = () => {
    setIsMenuOpen(false);
    const url = new URL(getInfoBase());
    url.searchParams.set('view', 'company');
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
  };

  const redirectToProject = () => {
    setIsMenuOpen(false);
    const url = new URL(getInfoBase());
    url.searchParams.set('view', 'project');
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
  };

  return (
    <>
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[110] transition-transform duration-300 ease-out',
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        {/* Layer 1: Marquee (h-8 — Info standard) */}
        <div className="bg-[#0a0a0a] border-b border-white/5 h-8 flex items-center overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center shrink-0">
                <span className="text-[9px] font-bold text-[#d4af37] px-8 uppercase flex items-center gap-2">
                  <Gem size={10} /> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)
                </span>
                <span className="text-[9px] font-bold text-white/30 px-8 uppercase">{t.marqueeSpotAU}: ${currentPrice.toLocaleString()}</span>
                <span className="text-[9px] font-bold text-white/30 px-8 uppercase">USD/AED: {currencyRates.AED}</span>
                <span className="text-[9px] font-bold text-[#d4af37] px-8 uppercase">{t.marqueeInstLevel}</span>
                <span className="text-[9px] font-bold text-white/30 px-8 uppercase">USD/RUB: {currencyRates.RUB}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 2: Main Header — как в Info */}
        <header className="bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="flex items-center gap-3 p-1 pr-4 rounded-xl border transition-all bg-white/5 border-white/10 hover:bg-white/10">
              <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                {isMenuOpen ? <X className="text-black" size={16} /> : <Menu className="text-black" size={16} />}
              </div>
              <div className="flex flex-col">
                <span className="font-playfair font-black text-[9px] uppercase tracking-tight leading-tight text-white">Imperial</span>
                <span className="font-playfair font-black text-[9px] uppercase tracking-tight leading-tight text-white">Pure Gold</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn && onLogout && (
              <button onClick={onLogout} className="hidden md:flex items-center justify-center px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase hover:text-white transition-all border border-white/10">
                {t.signOut}
              </button>
            )}
            <button onClick={openProfileMenu} className="hidden md:flex items-center justify-center px-6 h-9 rounded-xl bg-[#d4af37] text-black text-[10px] font-bold uppercase hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20">
              {profileText}
            </button>
            <button onClick={openProfileMenu} className="md:hidden w-9 h-9 rounded-xl bg-[#d4af37] flex items-center justify-center text-black shadow-lg shadow-[#d4af37]/20">
              <User size={16} />
            </button>
          </div>
        </header>

        {/* Layer 3: Navigation Bar (60px) */}
        {!hideNavBar && (
        <div className="bg-white border-b border-stone-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-8 h-[60px] overflow-x-auto no-scrollbar md:justify-start">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'text-sm font-medium transition-colors relative h-full flex items-center gap-2 whitespace-nowrap flex-shrink-0 px-2',
                    currentPage === item.id ? 'text-[#d4af37]' : 'text-stone-500 hover:text-stone-900'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                  {currentPage === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d4af37]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Hamburger Menu — Info standard: left slide, white panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-full max-w-xs z-[160] bg-white border-r border-black/5 p-8 flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                  <span className="font-playfair font-black text-xs uppercase tracking-tight text-[#d4af37]">Imperial</span>
                  <span className="font-playfair font-black text-xs uppercase tracking-tight text-black">Pure Gold</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black/40 hover:text-black"><X size={24} /></button>
              </div>
              <nav className="flex flex-col gap-2">
                <MenuBtn icon={<LayoutDashboard size={20}/>} label={t.menuDashboard} active={currentPage === 'dashboard'} onClick={() => handleNav('dashboard')} />
                <MenuBtn icon={<Building2 size={20}/>} label={t.menuCompany} onClick={redirectToCompany} />
                <MenuBtn icon={<Info size={20}/>} label={t.menuProject} onClick={redirectToProject} />
                <MenuBtn icon={<Calculator size={20}/>} label={t.menuCalculator} active={currentPage === 'calculator'} onClick={() => handleNav('calculator')} />
                <div className="h-px bg-black/5 my-6" />
                <MenuBtn icon={<Phone size={20}/>} label={t.contactBtn} onClick={() => { setIsMenuOpen(false); setIsManagerPopupOpen(true); }} />
                <MenuBtn icon={<Globe size={20}/>} label={t.menuCompanySite} onClick={() => { setIsMenuOpen(false); window.location.href = 'https://imperialpuregold.ae'; }} />
                {isLoggedIn && onLogout && (
                  <MenuBtn icon={<LogOut size={20}/>} label={t.signOut} onClick={() => { setIsMenuOpen(false); onLogout(); }} />
                )}
                <div className="h-px bg-black/5 my-6" />
                <div className="flex items-center justify-center gap-3">
                  <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center text-[#1877f2] hover:border-[#1877f2]/40 hover:bg-[#1877f2]/10 transition-all" aria-label="Facebook">
                    <Facebook size={18} />
                  </a>
                  <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center text-[#0088cc] hover:border-[#0088cc]/40 hover:bg-[#0088cc]/10 transition-all" aria-label="Telegram">
                    <Send size={18} />
                  </a>
                  <a href="https://api.whatsapp.com/send/?phone=447776177435&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center text-green-600 hover:border-green-500/40 hover:bg-green-500/10 transition-all" aria-label="WhatsApp">
                    <MessageCircle size={18} />
                  </a>
                </div>
                <div className="h-px bg-black/5 my-6" />
              </nav>
              <div className="mt-auto pt-8 border-t border-black/5">
                <p className="text-[10px] text-black/20 uppercase font-bold">© 2026 Imperial Pure Gold</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Menu — like Info profile functionality */}
      <AnimatePresence>
        {isProfileMenuOpen && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileMenuOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 rounded-[2.5rem] w-full max-w-sm border border-black/5 flex flex-col gap-6 shadow-2xl"
            >
              <button onClick={() => setIsProfileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-black/20 hover:text-black"><X size={24} /></button>
              <div className="text-center space-y-2 mb-2">
                <h3 className="text-2xl font-playfair font-black text-black tracking-tight uppercase">{profileText}</h3>
                <div className="h-0.5 w-8 bg-[#d4af37] mx-auto" />
              </div>

              <button onClick={() => { setIsProfileMenuOpen(false); handleNav('profile'); }} className="flex items-center gap-4 p-5 bg-black/5 rounded-2xl hover:bg-black/10 transition-all text-left group">
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-black font-bold text-base tracking-tight">{profileText}</span>
                  <span className="text-black/40 text-[10px] font-bold uppercase tracking-normal">{t.menuDashboard}</span>
                </div>
              </button>

              <div className="p-5 bg-black/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-black/40">
                  <Globe size={16} />
                  <span className="text-[10px] font-black uppercase tracking-normal">{t.languageLabel ?? 'Language'}</span>
                </div>
                <div className="flex gap-2">
                  {(['ru', 'en'] as const).map((l) => (
                    <button key={l} onClick={() => setLang(l)} className={cn('flex-1 py-3 text-[11px] font-bold rounded-xl transition-all', lang === l ? 'bg-[#d4af37] text-black shadow-md' : 'bg-white text-black/40 hover:text-black')}>
                      {l === 'ru' ? 'Русский' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-black/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-black/40">
                  <MessageCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-normal">{t.personalManagerLabel ?? t.personalManager}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#d4af37]/30 transition-all group">
                    <Send size={18} className="text-[#0088cc]" />
                    <span className="text-sm font-bold text-black tracking-tight">Telegram</span>
                  </a>
                  <a href="https://api.whatsapp.com/send/?phone=447776177435&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#d4af37]/30 transition-all group">
                    <MessageCircle size={18} className="text-green-500" />
                    <span className="text-sm font-bold text-black tracking-tight">WhatsApp</span>
                  </a>
                  <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#d4af37]/30 transition-all group">
                    <Facebook size={18} className="text-[#1877f2]" />
                    <span className="text-sm font-bold text-black tracking-tight">Facebook</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manager Contact Popup */}
      {isManagerPopupOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsManagerPopupOpen(false)} />
          <div className="relative bg-white p-8 md:p-12 rounded-[2rem] w-full max-w-md border border-black/5 flex flex-col items-center shadow-2xl">
            <button onClick={() => setIsManagerPopupOpen(false)} className="absolute top-6 right-6 p-2 text-black/20 hover:text-black transition-all"><X size={24} /></button>
            <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-[#d4af37]/20"><User className="text-black" size={32} /></div>
            <h3 className="text-2xl md:text-3xl font-playfair font-black text-black text-center mb-4">{t.managerTitle}</h3>
            <p className="text-black/40 text-center text-sm mb-10 max-w-[280px]">{t.managerDesc}</p>
            <div className="flex flex-col gap-4 w-full">
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-[#d4af37]/40 hover:bg-black/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0088cc]/10 text-[#0088cc] group-hover:scale-110 transition-transform"><Send size={24} /></div>
                <span className="text-black font-bold text-lg">Telegram</span>
              </a>
              <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-green-500/40 hover:bg-black/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                <span className="text-black font-bold text-lg">WhatsApp</span>
              </a>
              <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-[#1877f2]/40 hover:bg-black/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#1877f2]/10 text-[#1877f2] group-hover:scale-110 transition-transform"><Facebook size={24} /></div>
                <span className="text-black font-bold text-lg">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MenuBtn = ({ icon, label, onClick, active = false }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) => (
  <button onClick={onClick} className={cn('flex items-center gap-4 p-4 rounded-2xl transition-all text-left group', active ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-black/60 hover:bg-black/5 hover:text-black')}>
    <span className={cn(active ? 'text-[#d4af37]' : 'text-black/20 group-hover:text-[#d4af37]')}>{icon}</span>
    <span className="text-sm font-bold uppercase">{label}</span>
  </button>
);

export default HeaderV2;
