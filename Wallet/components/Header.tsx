import React, { useState } from 'react';
import { Gem, Menu, Send, User, X, LayoutDashboard, Building2, Info, Calculator, Phone, Globe } from 'lucide-react';
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

  const buildAppUrl = (app: 'dashboard' | 'info' | 'invest' | 'wallet' | 'calculator') => {
    if (resolveLocalBase(1)) {
      const ports: Record<string, number> = { dashboard: 3000, info: 3003, invest: 5182, wallet: 5177, calculator: 5178 };
      return `http://${window.location.hostname}:${ports[app]}`;
    }
    const subdomains: Record<string, string> = { dashboard: 'dashboard.ipg-invest.ae', info: 'info.ipg-invest.ae', invest: 'ipg-invest.ae', wallet: 'wallet.ipg-invest.ae', calculator: 'calculator.ipg-invest.ae' };
    return `https://${subdomains[app]}`;
  };

  const openInfoView = (view: 'company' | 'project') => {
    const base = resolveLocalBase(3003) || 'https://info.ipg-invest.ae';
    const url = new URL(base);
    url.searchParams.set('view', view);
    setIsMenuOpen(false);
    window.location.href = url.toString();
  };

  const openApp = (app: 'dashboard' | 'info' | 'invest' | 'calculator') => {
    setIsMenuOpen(false);
    window.location.href = buildAppUrl(app);
  };

  const MenuBtn = ({ icon, label, onClick, active = false }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${active ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}>
      <span className={`${active ? 'text-[#d4af37]' : 'text-black/20 group-hover:text-[#d4af37]'}`}>{icon}</span>
      <span className="text-sm font-bold uppercase">{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed top-0 w-full z-[100] border-b h-8 flex items-center overflow-hidden bg-[#0a0a0a] border-white/5">
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

      <header className="fixed top-8 w-full z-[90] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-12 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className="flex items-center gap-3 p-1 pr-4 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 transition-all">
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
          <div className="flex p-1 rounded-lg border bg-white/5 border-white/10">
            {(['RU', 'EN'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${lang === l ? 'bg-[#d4af37] text-black shadow-sm' : 'text-white/40 hover:text-white'}`}>{l}</button>
            ))}
          </div>
          <button onClick={onManagerClick} className="hidden md:flex items-center justify-center px-6 h-9 rounded-xl bg-[#d4af37] text-black text-[10px] font-bold uppercase hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20">
            {t.contactBtn}
          </button>
          <button onClick={onManagerClick} className="md:hidden w-9 h-9 rounded-xl bg-[#d4af37] flex items-center justify-center text-black shadow-lg shadow-[#d4af37]/20">
            <Phone size={16} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs z-[160] bg-white border-r border-black/5 p-8 flex flex-col animate-[slideIn_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-12">
              <div className="flex flex-col">
                <span className="font-playfair font-black text-xs uppercase tracking-tight text-[#d4af37]">Imperial</span>
                <span className="font-playfair font-black text-xs uppercase tracking-tight text-black">Pure Gold</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black/40 hover:text-black"><X size={24} /></button>
            </div>
            <nav className="flex flex-col gap-2">
              <MenuBtn icon={<LayoutDashboard size={20}/>} label={t.menuDashboard} onClick={() => openApp('dashboard')} />
              <MenuBtn icon={<Building2 size={20}/>} label={t.menuCompany} onClick={() => openInfoView('company')} />
              <MenuBtn icon={<Info size={20}/>} label={t.menuProject} onClick={() => openInfoView('project')} />
              <MenuBtn icon={<Calculator size={20}/>} label={t.menuCalculator} onClick={() => { setIsMenuOpen(false); window.location.href = `${buildAppUrl('dashboard')}?calculator=true`; }} />
              <div className="h-px bg-black/5 my-6" />
              <MenuBtn icon={<Phone size={20}/>} label={t.contactBtn} onClick={() => { setIsMenuOpen(false); onManagerClick(); }} />
              <MenuBtn icon={<Globe size={20}/>} label={t.menuCompanySite} onClick={() => { setIsMenuOpen(false); window.location.href = 'https://imperialpuregold.ae'; }} />
            </nav>
            <div className="mt-auto pt-8 border-t border-black/5">
              <p className="text-[10px] text-black/20 uppercase font-bold">© 2026 Imperial Pure Gold</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
