import React, { useState, useEffect } from 'react';
import { Gem, Menu, MessageCircle, Send, User, X, LayoutDashboard, Building2, Info, Calculator, Phone, Globe, LogOut, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Translation, ViewState } from '../types';

interface HeaderProps {
  t: Translation;
  lang: Language;
  setLang: (lang: Language) => void;
  setView: (view: ViewState) => void;
  currentView: ViewState;
}

const resolveLocalBase = (port: number) => {
  const host = window.location.hostname;
  const isLocalLike = host === 'localhost' || host === '127.0.0.1' || host === '::1' ||
    host.startsWith('192.168.') || host.startsWith('10.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  return isLocalLike ? `http://${host}:${port}` : null;
};

const buildAppUrl = (app: 'dashboard' | 'wallet' | 'invest' | 'info' | 'calculator') => {
  const ports: Record<typeof app, number> = {
    dashboard: 3000,
    wallet: 5177,
    invest: 5182,
    info: 3003,
    calculator: 5178
  };
  const localBase = resolveLocalBase(ports[app]);
  if (localBase) return localBase;
  const subdomains: Record<typeof app, string> = {
    dashboard: 'https://dashboard.ipg-invest.ae',
    wallet: 'https://wallet.ipg-invest.ae',
    invest: 'https://ipg-invest.ae',
    info: 'https://info.ipg-invest.ae',
    calculator: 'https://calculator.ipg-invest.ae'
  };
  return subdomains[app];
};

const Header: React.FC<HeaderProps> = ({ t, lang, setLang, setView, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isDark = currentView === 'company';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-white/10' : 'border-black/5';
  const bgColor = isDark ? 'bg-white/5' : 'bg-black/5';

  const [currentPrice, setCurrentPrice] = useState(2780);
  const [yearlyGrowth, setYearlyGrowth] = useState(8.4);
  const [currencyRates, setCurrencyRates] = useState({ AED: '3.67', RUB: '91.42' });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        // keep defaults
      }
    };

    fetchPrices();
  }, []);

  const handleNavClick = (view: ViewState) => {
    setView(view);
    setIsMenuOpen(false);
  };

  const openApp = (app: 'dashboard' | 'wallet' | 'invest' | 'calculator') => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    window.location.href = buildAppUrl(app);
  };

  const openCalculator = () => {
    setIsMenuOpen(false);
    window.location.href = `${buildAppUrl('dashboard')}?calculator=true`;
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    sessionStorage.removeItem('ipg_token');
    sessionStorage.removeItem('ipg_refresh_token');
    sessionStorage.removeItem('ipg_user_id');
    window.location.href = `${buildAppUrl('dashboard')}/login.html`;
  };

  return (
    <>
      <div className={`fixed top-0 w-full z-[100] border-b h-8 flex items-center overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-black/5'}`}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center shrink-0">
               <span className="text-[9px] font-bold text-[#d4af37] px-8 uppercase flex items-center gap-2">
                <Gem size={10} /> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)
              </span>
               <span className={`text-[9px] font-bold px-8 uppercase transition-colors duration-500 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                {t.marqueeSpotAU}: ${currentPrice.toLocaleString()}
              </span>
               <span className={`text-[9px] font-bold px-8 uppercase transition-colors duration-500 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                USD/AED: {currencyRates.AED}
              </span>
               <span className="text-[9px] font-bold text-[#d4af37] px-8 uppercase">
                {t.marqueeInstLevel}
              </span>
               <span className={`text-[9px] font-bold px-8 uppercase transition-colors duration-500 ${isDark ? 'text-white/30' : 'text-black/30'}`}>
                USD/RUB: {currencyRates.RUB}
              </span>
            </div>
          ))}
        </div>
      </div>

      <header className={`fixed top-8 w-full z-[90] transition-all duration-500 px-6 md:px-12 h-16 flex justify-between items-center ${scrolled ? (isDark ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5' : 'bg-white/80 backdrop-blur-xl border-b border-black/5') : 'bg-transparent'}`}>
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`flex items-center gap-3 p-1 pr-4 rounded-xl border transition-all ${bgColor} ${borderColor} hover:bg-opacity-20`}>
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              {isMenuOpen ? <X className="text-black" size={16} /> : <Menu className="text-black" size={16} />}
            </div>
            <div className="flex flex-col">
              <span className={`font-playfair font-black text-[9px] uppercase tracking-tight leading-tight transition-colors duration-500 ${textColor}`}>Imperial</span>
              <span className={`font-playfair font-black text-[9px] uppercase tracking-tight leading-tight transition-colors duration-500 ${textColor}`}>Pure Gold</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`hidden md:flex p-1 rounded-lg border transition-colors duration-500 ${bgColor} ${borderColor}`}>
            {['RU', 'EN'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l as Language)} 
                className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${lang === l ? 'bg-[#d4af37] text-black shadow-sm' : `${textColor} opacity-40 hover:opacity-100`}`}
              >
                {l}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsManagerModalOpen(true)} 
            className="hidden md:flex items-center justify-center px-6 h-9 rounded-xl bg-[#d4af37] text-black text-[10px] font-bold uppercase hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20"
          >
            {t.contactBtn}
          </button>

          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
            className="md:hidden w-9 h-9 rounded-xl bg-[#d4af37] flex items-center justify-center text-black shadow-lg shadow-[#d4af37]/20 relative"
          >
            {isUserMenuOpen ? <X size={16} /> : <User size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile User Menu Modal */}
      <AnimatePresence>
        {isUserMenuOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserMenuOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 rounded-[2.5rem] w-full max-w-sm border border-black/5 flex flex-col gap-6 shadow-2xl"
            >
              <button
                onClick={() => setIsUserMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-black/20 hover:text-black transition-all"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-2 mb-2">
                <h3 className="text-2xl font-playfair font-black text-black tracking-tight uppercase">
                  {t.profileLabel}
                </h3>
                <div className="h-0.5 w-8 bg-[#d4af37] mx-auto" />
              </div>

              <button 
                onClick={() => openApp('dashboard')}
                className="flex items-center gap-4 p-5 bg-black/5 rounded-2xl hover:bg-black/10 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-black font-bold text-base tracking-tight">{t.menuDashboard}</span>
                  <span className="text-black/40 text-[10px] font-bold uppercase tracking-normal">{t.profileLabel}</span>
                </div>
              </button>

              <div className="p-5 bg-black/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-black/40">
                  <Globe size={16} />
                  <span className="text-[10px] font-black uppercase tracking-normal">{t.languageLabel}</span>
                </div>
                <div className="flex gap-2">
                  {['RU', 'EN'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => setLang(l as Language)} 
                      className={`flex-1 py-3 text-[11px] font-bold rounded-xl transition-all ${lang === l ? 'bg-[#d4af37] text-black shadow-md' : 'bg-white text-black/40 hover:text-black'}`}
                    >
                      {l === 'RU' ? 'Русский' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-black/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-black/40">
                  <MessageCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-normal">{t.personalManagerLabel}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://t.me/IPG_Mark" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#d4af37]/30 transition-all group"
                  >
                    <Send size={18} className="text-[#0088cc]" />
                    <span className="text-sm font-bold text-black tracking-tight">Telegram</span>
                  </a>
                  <a 
                    href="https://wa.me/447776177435" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#d4af37]/30 transition-all group"
                  >
                    <MessageCircle size={18} className="text-green-500" />
                    <span className="text-sm font-bold text-black tracking-tight">WhatsApp</span>
                  </a>
                  <a 
                    href="https://www.facebook.com/share/1Dox5wK2MT/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 hover:border-[#d4af37]/30 transition-all group"
                  >
                    <Facebook size={18} className="text-[#1877f2]" />
                    <span className="text-sm font-bold text-black tracking-tight">Facebook</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs z-[160] bg-white border-r border-black/5 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                  <span className="font-playfair font-black text-xs uppercase tracking-tight text-[#d4af37]">Imperial</span>
                  <span className="font-playfair font-black text-xs uppercase tracking-tight text-black">Pure Gold</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black/40 hover:text-black">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <MenuButton icon={<LayoutDashboard size={20}/>} label={t.menuDashboard} onClick={() => openApp('dashboard')} />
                <MenuButton 
                  icon={<Building2 size={20}/>} 
                  label={t.menuCompany} 
                  active={currentView === 'company'}
                  onClick={() => handleNavClick('company')} 
                />
                <MenuButton 
                  icon={<Info size={20}/>} 
                  label={t.menuProject} 
                  active={currentView === 'project'}
                  onClick={() => handleNavClick('project')} 
                />
                <MenuButton icon={<Calculator size={20}/>} label={t.menuCalculator} onClick={openCalculator} />
                
                <div className="h-px bg-black/5 my-6" />
                
                <MenuButton 
                  icon={<Phone size={20}/>} 
                  label={t.contactBtn} 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsManagerModalOpen(true);
                  }} 
                />
                <MenuButton icon={<Globe size={20}/>} label={t.menuCompanySite} onClick={() => { setIsMenuOpen(false); window.location.href = 'https://imperialpuregold.ae'; }} />
                <MenuButton icon={<LogOut size={20}/>} label={t.signOut} onClick={handleLogout} />
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

      <AnimatePresence>
        {isManagerModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManagerModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-8 md:p-12 rounded-[2rem] w-full max-w-md border border-black/5 flex flex-col items-center shadow-2xl"
            >
              <button
                onClick={() => setIsManagerModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-black/20 hover:text-black transition-all"
              >
                <X size={24} />
              </button>
              
              <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-[#d4af37]/20">
                <User className="text-black" size={32} />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-playfair font-black text-black text-center mb-4">
                {t.managerTitle}
              </h3>
              <p className="text-black/40 text-center text-sm mb-10 max-w-[280px]">
                {t.managerDesc}
              </p>
              
              <div className="flex flex-col gap-4 w-full">
                <ContactOption 
                  icon={<Send size={24} />} 
                  label="Telegram" 
                  href="https://t.me/IPG_Mark" 
                  color="bg-[#0088cc]/10 text-[#0088cc]"
                />
                <ContactOption 
                  icon={<MessageCircle size={24} />} 
                  label="WhatsApp" 
                  href="https://wa.me/447776177435" 
                  color="bg-green-500/10 text-green-500"
                />
                <ContactOption 
                  icon={<Facebook size={24} />} 
                  label="Facebook" 
                  href="https://www.facebook.com/share/1Dox5wK2MT/" 
                  color="bg-[#1877f2]/10 text-[#1877f2]"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuButton = ({ icon, label, onClick, active = false }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${active ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}
  >
    <span className={`${active ? 'text-[#d4af37]' : 'text-black/20 group-hover:text-[#d4af37]'} transition-colors`}>{icon}</span>
    <span className="text-sm font-bold uppercase">{label}</span>
  </button>
);

const ContactOption = ({ icon, label, href, color }: { icon: React.ReactNode, label: string, href: string, color: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-[#d4af37]/40 hover:bg-black/[0.08] transition-all group"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="text-black font-bold text-lg">{label}</span>
  </a>
);

export default Header;
