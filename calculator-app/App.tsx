import React, { useState, useMemo, useEffect } from 'react';
import { MAX_CYCLES, MIN_INVESTMENT, MAX_INVESTMENT, DEFAULT_INVESTMENT, CYCLE_DAYS, API_ENDPOINTS } from './constants';
import { calculateInvestment } from './utils/calculatorLogic';
import { CurrencyInput, RangeSlider, Toggle } from './components/InputGroup';
import { SummaryCard } from './components/SummaryCard';
import { GrowthChart } from './components/GrowthChart';
import { ResultsTable } from './components/ResultsTable';
import { Button } from './components/Button';
import { Calculator, ArrowRight, AlertTriangle, Gem, Menu, X, Send, User, MessageCircle, Mail, LayoutDashboard, Building2, Info, Phone, Globe } from 'lucide-react';
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
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [currentPrice, setCurrentPrice] = useState(2050.5);
  const [yearlyGrowth, setYearlyGrowth] = useState(8.4);
  const [currencyRates, setCurrencyRates] = useState({ AED: '3.67', RUB: '98.50' });

  const apiBase = (window as any).__IPG_API_BASE || 'http://localhost:3001';

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

  // Handle Action
  useEffect(() => {
    const CACHE_KEY = 'ipg:calculator:market-data';
    const CACHE_TTL = 5 * 60 * 1000;

    const applyData = (data: any) => {
      const price = Number(data?.goldPrice) || 2050.5;
      setCurrentPrice(price);
      setCurrencyRates({
        AED: Number(data?.currencyRates?.AED || 3.67).toFixed(2),
        RUB: Number(data?.currencyRates?.RUB || 98.5).toFixed(2)
      });
      setYearlyGrowth(Number(data?.yearlyGrowth || 8.4));
    };

    const fetchMarket = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            applyData(parsed.data);
            return;
          }
        } catch {
          // ignore cache
        }
      }

      try {
        const res = await fetch(`${apiBase}${API_ENDPOINTS.MARKET_DATA}`);
        if (!res.ok) throw new Error('Market data unavailable');
        const data = await res.json();
        applyData(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch {
        applyData(null);
      }
    };

    fetchMarket();
  }, [apiBase]);

  useEffect(() => {
    if (isMenuOpen || isManagerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, isManagerModalOpen]);

  const t = locales[lang];
  const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  const openApp = (app: 'dashboard' | 'info' | 'invest') => {
    const base = 'https://ipg-invest.ae';
    const localPorts: Record<typeof app, number> = {
      dashboard: 3000,
      info: 3003,
      invest: 5182
    };
    const paths: Record<typeof app, string> = {
      dashboard: '/dashboard',
      info: '/info',
      invest: '/'
    };
    window.location.href = isLocalHost ? `http://localhost:${localPorts[app]}` : `${base}${paths[app]}`;
  };

  const openInfoView = (view: 'company' | 'project') => {
    const base = isLocalHost ? 'http://localhost:3003' : 'https://info.ipg-invest.ae';
    const url = new URL(base);
    url.searchParams.set('view', view);
    url.searchParams.set('lang', lang === 'ru' ? 'RU' : 'EN');
    window.location.href = url.toString();
  };

  const openCalculator = () => {
    if (isLocalHost) window.location.href = 'http://localhost:5178';
    else window.location.href = 'https://calculator.ipg-invest.ae';
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
    
    // Save to session storage
    sessionStorage.setItem('calculatorData', JSON.stringify(payload));

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

    const isLocal = window.location.hostname === 'localhost';
    const dashboardUrl = isLocal ? 'http://localhost:3000' : 'https://ipg-invest.ae/dashboard';
    window.location.href = `${dashboardUrl}?calculator=true`;
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

      {/* Header — Info standard h-16 */}
      <header className="fixed top-8 w-full z-[90] bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-12 h-16 flex justify-between items-center">
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
              <MenuBtn icon={<Calculator size={20}/>} label={t.menuCalculator} active onClick={() => { setIsMenuOpen(false); const dashboardUrl = isLocalHost ? 'http://localhost:3000' : 'https://dashboard.ipg-invest.ae'; window.location.href = `${dashboardUrl}?calculator=true`; }} />
              <div className="h-px bg-black/5 my-6" />
              <MenuBtn icon={<Phone size={20}/>} label={t.contactBtn} onClick={() => { setIsMenuOpen(false); setIsManagerModalOpen(true); }} />
              <MenuBtn icon={<Globe size={20}/>} label={t.menuCompanySite} onClick={() => { setIsMenuOpen(false); window.location.href = 'https://imperialpuregold.ae'; }} />
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0088cc]/10 text-[#0088cc] group-hover:scale-110 transition-transform"><Send size={24} /></div>
                <div className="flex flex-col"><span className="text-black font-bold text-lg">Telegram</span><span className="text-black/30 text-[10px] font-bold uppercase">{t.managerTelegramSub}</span></div>
              </a>
              <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-black/5 border border-black/5 rounded-2xl hover:border-green-500/40 hover:bg-black/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                <div className="flex flex-col"><span className="text-black font-bold text-lg">WhatsApp</span><span className="text-black/30 text-[10px] font-bold uppercase">{t.managerWhatsappSub}</span></div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Infov2 standard (65% smaller) */}
      <footer className="bg-[#0a0a0a] text-white pt-3 pb-1.5 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-3">
            <div className="flex flex-col items-start">
              <h4 className="text-[7px] font-black uppercase tracking-widest text-[#d4af37] mb-1">{t.footerCompliance}</h4>
              <div className="flex flex-col gap-0.5 text-left">
                <a href="#" className="text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">{t.footerPrivacy}</a>
                <a href="#" className="text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">{t.footerTerms}</a>
                <a href="#" className="text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">{t.footerRisk}</a>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <h4 className="text-[7px] font-black uppercase tracking-widest text-[#d4af37] mb-1">{t.footerNetwork}</h4>
              <div className="flex flex-col gap-0.5 text-right">
                <a href="mailto:info@ipg-invest.ae" className="flex items-center justify-end gap-1 text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold break-all"><Mail size={8} /> info@ipg-invest.ae</a>
                <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold"><Send size={8} /> Telegram</a>
                <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold"><MessageCircle size={8} /> {t.footerSupport}</a>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 gold-gradient rounded flex items-center justify-center shadow-lg"><Gem className="text-black" size={8} /></div>
              <span className="font-playfair font-black text-[7px] uppercase tracking-tight text-white/40">Imperial Pure Gold</span>
            </div>
            <p className="text-[7px] text-white/20 font-medium tracking-wide">© {new Date().getFullYear()} IPG DMCC. {t.rights.toUpperCase()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;