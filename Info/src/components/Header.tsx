import React, { useState, useEffect } from 'react';
import { Menu, User, X, LayoutDashboard, Building2, Info, Calculator, Phone, Globe, LogOut } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <header className={`fixed top-0 w-full z-[90] transition-all duration-500 px-6 md:px-12 h-16 flex justify-between items-center ${scrolled ? (isDark ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5' : 'bg-white/80 backdrop-blur-xl border-b border-black/5') : 'bg-transparent'}`}>
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
              
              <div className="flex flex-col gap-3 w-full">
                <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="p-4 bg-black/5 border border-black/5 rounded-2xl hover:border-[#d4af37]/40 hover:bg-black/[0.08] transition-all text-black font-bold text-center">Telegram</a>
                <a href="https://wa.me/447776177435" target="_blank" rel="noreferrer" className="p-4 bg-black/5 border border-black/5 rounded-2xl hover:border-[#d4af37]/40 hover:bg-black/[0.08] transition-all text-black font-bold text-center">WhatsApp</a>
                <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="p-4 bg-black/5 border border-black/5 rounded-2xl hover:border-[#d4af37]/40 hover:bg-black/[0.08] transition-all text-black font-bold text-center">Facebook</a>
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

export default Header;
