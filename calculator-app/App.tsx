import React, { useState, useMemo, useEffect } from 'react';
import { MAX_CYCLES, MIN_INVESTMENT, MAX_INVESTMENT, DEFAULT_INVESTMENT, CYCLE_DAYS, API_ENDPOINTS } from './constants';
import { LegalModal } from '../shared/LegalModal';
import { Footer } from '../shared/Footer';
import { calculateInvestment } from './utils/calculatorLogic';
import { CurrencyInput, RangeSlider, Toggle } from './components/InputGroup';
import { SummaryCard } from './components/SummaryCard';
import { GrowthChart } from './components/GrowthChart';
import { ResultsTable } from './components/ResultsTable';
import { Button } from './components/Button';
import { Calculator, ArrowRight, AlertTriangle, Menu, X, Send, User, MessageCircle, Mail, LayoutDashboard, Building2, Info, Phone, Globe, LogOut, Facebook } from 'lucide-react';
import { locales } from './locales';

const App: React.FC = () => {
  // State
  const [initialInvestment, setInitialInvestment] = useState<number>(DEFAULT_INVESTMENT);
  const [cycles, setCycles] = useState<number>(MAX_CYCLES);
  const [reinvestmentEnabled, setReinvestmentEnabled] = useState<boolean>(true);
  const [reinvestmentPercentage, setReinvestmentPercentage] = useState<number>(100);
  const [validationError, setValidationError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'risks' | null>(null);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

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
    const ports: Record<typeof app, number> = {
      dashboard: 3000,
      info: 3003,
      invest: 5182,
      wallet: 5177,
      calculator: 5178
    };
    const localBase = resolveLocalBase(ports[app]);
    if (localBase) return localBase;
    const subdomains: Record<typeof app, string> = {
      dashboard: 'https://dashboard.ipg-invest.ae',
      info: 'https://info.ipg-invest.ae',
      invest: 'https://ipg-invest.ae',
      wallet: 'https://wallet.ipg-invest.ae',
      calculator: 'https://calculator.ipg-invest.ae'
    };
    return subdomains[app];
  };

  const apiBase =
    (window as any).__IPG_API_BASE ||
    resolveLocalBase(3001) ||
    'https://api.ipg-invest.ae';

  // Validate Input
  useEffect(() => {
    if (initialInvestment < MIN_INVESTMENT) {
      setValidationError(`Минимальная сумма: $${MIN_INVESTMENT}`);
    } else if (initialInvestment > MAX_INVESTMENT) {
      setValidationError(`Максимальная сумма: $${(MAX_INVESTMENT / 1000000)}M`);
    } else {
      setValidationError('');
    }
  }, [initialInvestment]);

  // Calculate Results
  const results = useMemo(() => {
    // Pass valid investment or 0 to avoid breaking math visually
    const safeInvestment = (initialInvestment >= MIN_INVESTMENT && initialInvestment <= MAX_INVESTMENT) 
      ? initialInvestment 
      : (initialInvestment < MIN_INVESTMENT ? MIN_INVESTMENT : MAX_INVESTMENT);

    return calculateInvestment(
      safeInvestment,
      cycles,
      reinvestmentEnabled,
      reinvestmentPercentage
    );
  }, [initialInvestment, cycles, reinvestmentEnabled, reinvestmentPercentage]);

  useEffect(() => {
    if (isMenuOpen || isManagerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, isManagerModalOpen]);

  const t = locales[lang];

  const openApp = (app: 'dashboard' | 'info' | 'invest') => {
    window.location.href = buildAppUrl(app);
  };

  const openInfoView = (view: 'company' | 'project') => {
    const base = buildAppUrl('info');
    const url = new URL(base);
    url.searchParams.set('view', view);
    url.searchParams.set('lang', lang === 'ru' ? 'RU' : 'EN');
    window.location.href = url.toString();
  };

  const openCalculator = () => {
    window.location.href = buildAppUrl('calculator');
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    sessionStorage.removeItem('ipg_token');
    sessionStorage.removeItem('ipg_refresh_token');
    sessionStorage.removeItem('ipg_user_id');
    const loginUrl = `${buildAppUrl('dashboard').replace(/\/$/, '')}/login.html`;
    window.location.href = loginUrl;
  };

  const handleInvest = async () => {
    if (validationError) {
      setIsModalOpen(true);
      return;
    }

    const payload = {
      initialInvestment,
      cycles,
      reinvestmentEnabled,
      reinvestmentPercentage,
      calculatedAt: Date.now()
    };
    
    // Save to API (non-blocking)
    fetch(`${apiBase}${API_ENDPOINTS.CALCULATE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initialInvestment,
        cycles,
        reinvestmentEnabled,
        reinvestmentPercentage
      })
    }).catch(() => {});

    const dashboardBase = buildAppUrl('dashboard');
    const fundingUrl = new URL(`${dashboardBase.replace(/\/$/, '')}/`);
    fundingUrl.searchParams.set('flow', 'funding');
    fundingUrl.searchParams.set('amount', String(initialInvestment));
    window.location.href = fundingUrl.toString();
  };

  const MenuBtn = ({ icon, label, onClick, active = false }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${active ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-black/60 hover:bg-black/5 hover:text-black'}`}>
      <span className={`${active ? 'text-[#d4af37]' : 'text-black/20 group-hover:text-[#d4af37]'}`}>{icon}</span>
      <span className="text-sm font-bold uppercase">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#d4af37] selection:text-black pb-20">
      {/* Marquee — Info standard h-8 */}
      {/* Header — Info standard h-16 */}
      <header className="fixed top-0 w-full z-[90] bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <button onClick={() => setLang('ru')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${lang === 'ru' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-white/40 hover:text-white'}`}>RU</button>
            <button onClick={() => setLang('en')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${lang === 'en' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-white/40 hover:text-white'}`}>EN</button>
          </div>
          <button onClick={() => setIsManagerModalOpen(true)} className="hidden md:flex items-center justify-center px-6 h-9 rounded-xl bg-[#d4af37] text-black text-[10px] font-bold uppercase hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20">
            {t.contactBtn}
          </button>
          <button onClick={() => setIsManagerModalOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-[#d4af37] flex items-center justify-center text-black shadow-lg shadow-[#d4af37]/20">
            <Phone size={16} />
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-36 md:pt-44 pb-24 px-6 md:px-12 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="hidden lg:block text-center mb-16 px-4">
            <h2 className="text-4xl md:text-6xl font-playfair font-black text-slate-900 mb-6 tracking-tight">{lang === 'ru' ? 'Калькулятор доходности' : 'Yield Calculator'} <span className="text-[#d4af37] italic">{lang === 'ru' ? 'золота' : 'gold'}</span></h2>
            <p className="text-slate-600 text-base md:text-xl max-w-2xl mx-auto font-medium">{lang === 'ru' ? 'Смоделируйте рост портфеля с учётом циклов и реинвестирования.' : 'Model portfolio growth with cycles and reinvestment.'}</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="representative-card p-6 lg:p-8 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <span className="card-badge">
                  <Calculator className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Параметры' : 'Parameters'}
                </span>
              </div>

              <div className="py-5 px-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm mb-4">
              <CurrencyInput
                label="Сумма инвестиции"
                value={initialInvestment}
                onChange={setInitialInvestment}
                min={MIN_INVESTMENT}
                max={MAX_INVESTMENT}
                error={validationError}
              />
              </div>

              <div className="my-4 py-5 px-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
              <RangeSlider
                label="Количество циклов"
                subtitle={`~${cycles * CYCLE_DAYS} дней`}
                value={cycles}
                onChange={setCycles}
                min={1}
                max={MAX_CYCLES}
                suffix=" циклов"
              />
              </div>

              <Toggle
                label="Реинвестировать прибыль"
                checked={reinvestmentEnabled}
                onChange={setReinvestmentEnabled}
              />

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${reinvestmentEnabled ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="my-4 py-5 px-5 bg-amber-50/70 rounded-2xl border-2 border-amber-100">
                <RangeSlider
                  label="Доля реинвестирования"
                  value={reinvestmentPercentage}
                  onChange={setReinvestmentPercentage}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button 
                  fullWidth 
                  onClick={handleInvest} 
                  disabled={!!validationError}
                  className="group py-5 rounded-2xl text-lg uppercase tracking-wide"
                >
                  <span className="mr-2">{lang === 'ru' ? 'Инвестировать' : 'Invest'}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {validationError && (
                  <div className="flex items-center justify-center mt-3 text-red-400 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span>Исправьте ошибки для продолжения</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Data */}
          <div className="lg:col-span-8 space-y-8">
            <SummaryCard data={results} />
            <GrowthChart 
              stages={results.stages} 
              initialInvestment={results.totalInvested}
            />
            <ResultsTable stages={results.stages} />
          </div>

        </div>
        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm text-center shadow-xl">
            <h3 className="text-lg font-serif font-bold mb-2 text-slate-900">Ошибка</h3>
            <p className="text-sm text-slate-600">Минимальная сумма инвестиции: ${MIN_INVESTMENT}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full py-2 rounded-xl gold-gradient text-black font-bold"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs z-[160] bg-white border-r border-black/5 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div className="flex flex-col">
                <span className="font-playfair font-black text-xs uppercase tracking-tight text-[#d4af37]">Imperial</span>
                <span className="font-playfair font-black text-xs uppercase tracking-tight text-black">Pure Gold</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black/40 hover:text-black"><X size={24} /></button>
            </div>
            <nav className="flex flex-col gap-2">
              <MenuBtn icon={<LayoutDashboard size={20}/>} label={t.menuDashboard} onClick={() => { openApp('dashboard'); setIsMenuOpen(false); }} />
              <MenuBtn icon={<Building2 size={20}/>} label={t.menuCompany} onClick={() => { openInfoView('company'); setIsMenuOpen(false); }} />
              <MenuBtn icon={<Info size={20}/>} label={t.menuProject} onClick={() => { openInfoView('project'); setIsMenuOpen(false); }} />
              <MenuBtn icon={<Calculator size={20}/>} label={t.menuCalculator} active onClick={() => { setIsMenuOpen(false); window.location.href = `${buildAppUrl('dashboard')}?calculator=true`; }} />
              <div className="h-px bg-black/5 my-6" />
              <MenuBtn icon={<Phone size={20}/>} label={t.contactBtn} onClick={() => { setIsMenuOpen(false); setIsManagerModalOpen(true); }} />
              <MenuBtn icon={<Globe size={20}/>} label={t.menuCompanySite} onClick={() => { setIsMenuOpen(false); window.location.href = 'https://imperialpuregold.ae'; }} />
              {typeof sessionStorage !== 'undefined' && sessionStorage.getItem('ipg_token') && (
                <MenuBtn icon={<LogOut size={20}/>} label={t.signOut} onClick={handleLogout} />
              )}
              <div className="h-px bg-black/5 my-6" />
            </nav>
            <div className="mt-auto pt-8 border-t border-black/5">
              <p className="text-[10px] text-black/20 uppercase font-bold">© 2026 Imperial Pure Gold</p>
            </div>
          </div>
        </>
      )}

      {isManagerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsManagerModalOpen(false)}></div>
          <div className="relative bg-white p-8 md:p-12 rounded-[2rem] w-full max-w-md border border-black/5 flex flex-col items-center shadow-2xl">
            <button onClick={() => setIsManagerModalOpen(false)} className="absolute top-6 right-6 p-2 text-black/20 hover:text-black transition-all"><X size={24} /></button>
            <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-[#d4af37]/20"><User className="text-black" size={32} /></div>
            <h3 className="text-2xl md:text-3xl font-playfair font-black text-black text-center mb-4">{t.managerTitle}</h3>
            <p className="text-black/40 text-center text-sm mb-10 max-w-[280px]">{t.managerDesc}</p>
            <div className="flex flex-col gap-4 w-full">
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-[#d4af37]/40 hover:bg-black/[0.08] transition-all group">
                <span className="text-black font-bold text-lg">Telegram</span>
              </a>
              <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-green-500/40 hover:bg-black/[0.08] transition-all group">
                <span className="text-black font-bold text-lg">WhatsApp</span>
              </a>
              <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-[#1877f2]/40 hover:bg-black/[0.08] transition-all group">
                <span className="text-black font-bold text-lg">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer t={t} onLegalClick={(type) => setLegalModal(type)} />
      {legalModal && (
        <LegalModal
          type={legalModal}
          lang={lang}
          onClose={() => setLegalModal(null)}
          closeLabel={t.legalModalClose}
        />
      )}
    </div>
  );
};

export default App;
