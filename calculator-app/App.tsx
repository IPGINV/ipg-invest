import React, { useState, useMemo, useEffect } from 'react';
import { MAX_CYCLES, MIN_INVESTMENT, MAX_INVESTMENT, DEFAULT_INVESTMENT, CYCLE_DAYS, API_ENDPOINTS } from './constants';
import { calculateInvestment } from './utils/calculatorLogic';
import { CurrencyInput, RangeSlider, Toggle } from './components/InputGroup';
import { SummaryCard } from './components/SummaryCard';
import { GrowthChart } from './components/GrowthChart';
import { ResultsTable } from './components/ResultsTable';
import { Button } from './components/Button';
import { Calculator, ArrowRight, AlertTriangle, Gem, Menu, X, Send, User, MessageCircle, Mail, ShieldCheck, Award, Lock } from 'lucide-react';

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

  const openApp = (app: 'dashboard' | 'info' | 'invest') => {
    const isLocal = window.location.hostname === 'localhost';
    const base = 'https://ipg-invest.ae';
    const localPorts: Record<typeof app, number> = {
      dashboard: 5174,
      info: 5173,
      invest: 5176
    };
    const paths: Record<typeof app, string> = {
      dashboard: '/dashboard',
      info: '/info',
      invest: '/'
    };
    window.location.href = isLocal ? `http://localhost:${localPorts[app]}` : `${base}${paths[app]}`;
  };

  const openInfoView = (view: 'company' | 'project') => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5173' : 'https://ipg-invest.ae/info';
    const url = new URL(base);
    url.searchParams.set('view', view);
    window.location.href = url.toString();
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
    const dashboardUrl = isLocal ? 'http://localhost:5174' : 'https://ipg-invest.ae/dashboard';
    window.location.href = `${dashboardUrl}?calculator=true`;
  };

  return (
    <div className="min-h-screen bg-[#141417] text-white selection:bg-gold selection:text-black pb-20">
      {/* Top Marquee (Dashboard style) */}
      <div className="fixed top-0 left-0 right-0 z-[110]">
        <div className="bg-[#0c0c0e] border-b border-white/5 h-10 flex items-center overflow-hidden">
          <div className="ticker-content">
            {[1, 2].map((group) => (
              <div key={group} className="flex items-center">
                <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
                  <Gem size={10} /> LBMA: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)
                </span>
                <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">SPOT AU: ${currentPrice.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">USD/AED: {currencyRates.AED}</span>
                <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase">Чистота 999.9</span>
                <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2">
                  <Gem size={10} /> Физический металл
                </span>
                <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">USD/RUB: {currencyRates.RUB}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header (Dashboard style) */}
      <header className="fixed top-10 w-full z-[90] bg-[#141417]/25 backdrop-blur-3xl border-b border-white/5 px-4 md:px-12 h-20 flex justify-between items-center">
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
            <button className="px-2.5 py-1 text-[9px] font-black rounded-lg transition-all bg-[#d4af37] text-black">RU</button>
            <button className="px-2.5 py-1 text-[9px] font-black rounded-lg transition-all text-white/40 hover:text-white">EN</button>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 group/hub">
            <div className={`flex items-center gap-2 transition-all duration-500 overflow-hidden ${isContactExpanded ? 'max-w-[150px] md:max-w-[200px] opacity-100 pr-2' : 'max-w-0 opacity-0'}`}>
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex-shrink-0"><Send size={16} /></a>
              <button onClick={() => setIsManagerModalOpen(true)} className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:text-[#d4af37] transition-all flex-shrink-0"><User size={16} /></button>
            </div>
            <button onClick={() => setIsContactExpanded(!isContactExpanded)} className={`flex items-center justify-center px-4 md:px-6 h-9 md:h-10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${isContactExpanded ? 'bg-white/10 text-white' : 'text-[#d4af37]'}`}>
              {isContactExpanded ? <X size={14} /> : 'Связаться'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm sticky top-28">
              <div className="flex items-center gap-2 mb-6 text-gold">
                <Calculator className="w-5 h-5" />
                <h2 className="font-serif font-bold text-xl">Параметры</h2>
              </div>

              <CurrencyInput
                label="Сумма инвестиции"
                value={initialInvestment}
                onChange={setInitialInvestment}
                min={MIN_INVESTMENT}
                max={MAX_INVESTMENT}
                error={validationError}
              />

              <div className="h-px bg-white/5 my-6"></div>

              <RangeSlider
                label="Количество циклов"
                subtitle={`~${cycles * CYCLE_DAYS} дней`}
                value={cycles}
                onChange={setCycles}
                min={1}
                max={MAX_CYCLES}
                suffix=" циклов"
              />

              <div className="h-px bg-white/5 my-6"></div>

              <Toggle
                label="Реинвестировать прибыль"
                checked={reinvestmentEnabled}
                onChange={setReinvestmentEnabled}
              />

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${reinvestmentEnabled ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
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

              <div className="mt-8">
                <Button 
                  fullWidth 
                  onClick={handleInvest} 
                  disabled={!!validationError}
                  className="group"
                >
                  <span className="mr-2">Инвестировать</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
          <div className="lg:col-span-8">
            <SummaryCard data={results} />
            
            <GrowthChart 
              stages={results.stages} 
              initialInvestment={results.totalInvested} 
            />
            
            <ResultsTable stages={results.stages} />

          </div>

        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#141417] border border-white/10 rounded-2xl p-6 max-w-sm text-center">
            <h3 className="text-lg font-serif font-bold mb-2">Ошибка</h3>
            <p className="text-sm text-gray-400">Минимальная сумма инвестиции: ${MIN_INVESTMENT}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full py-2 rounded-xl bg-gradient-to-br from-gold to-yellow-700 text-black font-bold"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#141417]/98 backdrop-blur-3xl animate-in fade-in duration-300 flex flex-col items-center justify-center p-6">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 p-3 bg-white/5 rounded-full border border-white/10 text-white/60 hover:text-[#d4af37] transition-all"><X size={32} /></button>
          <nav className="flex flex-col gap-6 w-full max-w-sm text-center">
            <button onClick={() => openApp('dashboard')} className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-white hover:text-[#d4af37] transition-all">Личный кабинет</button>
            <button onClick={() => openInfoView('company')} className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-white/40 hover:text-[#d4af37] transition-all">Компания</button>
            <button onClick={() => openInfoView('project')} className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-white/40 hover:text-[#d4af37] transition-all">Проект</button>
            <button onClick={() => setIsMenuOpen(false)} className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-white/40 hover:text-[#d4af37] transition-all">Калькулятор</button>
          </nav>
        </div>
      )}

      {isManagerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#141417]/80 backdrop-blur-sm" onClick={() => setIsManagerModalOpen(false)}></div>
          <div className="relative glass-card p-8 md:p-12 rounded-[3rem] w-full max-w-sm border border-white/10 flex flex-col items-center animate-in zoom-in-95 duration-300 bg-[#141417]">
            <button onClick={() => setIsManagerModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-all"><X size={24} /></button>
            <div className="w-16 h-16 md:w-20 md:h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl"><User className="text-black" size={32} /></div>
            <h3 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black text-white text-center mb-4">Связь с менеджером</h3>
            <p className="text-white/40 text-center text-sm md:text-base mb-10 font-medium mx-auto max-w-[220px]">Выберите удобный способ связи. Мы ответим в течение 15 минут.</p>
            <div className="flex flex-col gap-4 w-full">
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform"><Send size={24} /></div>
                <div className="flex flex-col"><span className="text-white font-bold text-lg">Telegram</span><span className="text-white/30 text-xs font-bold uppercase tracking-widest">Official</span></div>
              </a>
              <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-green-500/40 hover:bg-white/[0.08] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                <div className="flex flex-col"><span className="text-white font-bold text-lg">WhatsApp</span><span className="text-white/30 text-xs font-bold uppercase tracking-widest">Instant message</span></div>
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 py-12 px-6 md:px-20 bg-[#141417]/90 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="grid grid-cols-2 gap-0 w-full relative">
            <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-white/10 -translate-x-1/2"></div>
            <div className="space-y-6 flex flex-col items-center lg:items-start pr-4 md:pr-16 text-center lg:text-left">
              <h4 className="text-[10px] md:text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] pb-3 border-b border-[#d4af37]/15 w-full">Комплаенс</h4>
              <ul className="space-y-4 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
                <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer"><ShieldCheck size={16} className="text-[#d4af37]" /> <span>DMCC Registered</span></li>
                <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer"><Award size={16} className="text-[#d4af37]" /> <span>LBMA Standard</span></li>
                <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer"><Lock size={16} className="text-[#d4af37]" /> <span>Multi-Sig Security</span></li>
              </ul>
            </div>
            <div className="space-y-6 flex flex-col items-center lg:items-start pl-4 md:pl-16 text-center lg:text-left">
              <h4 className="text-[10px] md:text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] pb-3 border-b border-[#d4af37]/15 w-full">Сеть</h4>
              <ul className="space-y-4 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><a href="mailto:info@ipg-invest.ae" className="flex items-center gap-3"><Mail size={16} /> <span className="break-all">info@ipg-invest.ae</span></a></li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center gap-3"><Send size={16} /> <span>Official Telegram</span></a></li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-3"><MessageCircle size={16} /> <span>WhatsApp Support</span></a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 w-full">
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">© 2026 Imperial Pure Gold Trading LLC. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
              <button className="hover:text-[#d4af37] transition-colors">Privacy</button>
              <button className="hover:text-[#d4af37] transition-colors">Risks</button>
              <button className="hover:text-[#d4af37] transition-colors">Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;