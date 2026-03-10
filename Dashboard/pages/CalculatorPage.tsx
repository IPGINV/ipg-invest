import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator as CalculatorIcon,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Download,
  Maximize2,
  X,
  Table,
  ArrowRight
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useHeaderVisibility } from '../context/HeaderVisibilityContext';

const CYCLE_GAIN_RATE = 0.068;
const CYCLE_DAYS = 26;
const MAX_CYCLES = 14;
const MIN_INVESTMENT = 100;
const MAX_INVESTMENT = 10000000;
const DEFAULT_INVESTMENT = 10000;

interface CalculationStage {
  stageNumber: number;
  dayStart: number;
  dayEnd: number;
  principalAtStart: number;
  gainAmount: number;
  principalAtEnd: number;
  reinvested: number;
  withdrawn: number;
  totalValue: number;
}

interface CalculationResult {
  stages: CalculationStage[];
  totalInvested: number;
  totalGains: number;
  totalWithdrawn: number;
  finalValue: number;
  roi: number;
  multiplier: number;
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    style: 'currency',
    currency: 'USD',
  }).format(value);

const getApiBase = () => {
  const overrides = (window as any).__IPG_API_BASE;
  if (overrides) return overrides;
  return window.location.origin;
};

interface CalculatorPageProps {
  lang: 'en' | 'ru';
  onInvest: (amount: number) => void;
}

export function CalculatorPage({ lang, onInvest }: CalculatorPageProps) {
  const [principal, setPrincipal] = useState(DEFAULT_INVESTMENT);
  const [principalInput, setPrincipalInput] = useState(String(DEFAULT_INVESTMENT));
  const [cycles, setCycles] = useState(MAX_CYCLES);
  const [isReinvesting, setIsReinvesting] = useState(true);
  const [reinvestPercentage, setReinvestPercentage] = useState(100);
  const [showTableModal, setShowTableModal] = useState(false);
  const { setModalOverlay } = useHeaderVisibility() ?? { setModalOverlay: () => {} };

  useEffect(() => {
    setModalOverlay('table', showTableModal);
    return () => setModalOverlay('table', false);
  }, [showTableModal, setModalOverlay]);

  const results: CalculationResult = useMemo(() => {
    let currentPrincipal = principal;
    let totalWithdrawn = 0;
    let totalGains = 0;
    const stages: CalculationStage[] = [];

    for (let i = 1; i <= cycles; i++) {
      const gainAmount = currentPrincipal * CYCLE_GAIN_RATE;
      let reinvested = 0;
      let withdrawn = gainAmount;

      if (isReinvesting) {
        reinvested = gainAmount * (reinvestPercentage / 100);
        withdrawn = gainAmount - reinvested;
      }

      const principalAtEnd = currentPrincipal + reinvested;
      totalWithdrawn += withdrawn;
      totalGains += gainAmount;

      stages.push({
        stageNumber: i,
        dayStart: (i - 1) * CYCLE_DAYS,
        dayEnd: i * CYCLE_DAYS,
        principalAtStart: currentPrincipal,
        gainAmount,
        principalAtEnd,
        reinvested,
        withdrawn,
        totalValue: principalAtEnd + totalWithdrawn,
      });

      currentPrincipal = principalAtEnd;
    }

    const finalValue = currentPrincipal;
    const totalValue = finalValue + totalWithdrawn;
    const roi = ((totalValue - principal) / principal) * 100;
    const multiplier = totalValue / principal;

    return {
      stages,
      totalInvested: principal,
      totalGains,
      totalWithdrawn,
      finalValue,
      roi,
      multiplier,
    };
  }, [principal, cycles, isReinvesting, reinvestPercentage]);

  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setPrincipalInput(digitsOnly);

    if (!digitsOnly) {
      return;
    }

    setPrincipal(Number(digitsOnly));
  };

  const handleBlurPrincipal = () => {
    if (!principalInput) {
      setPrincipal(MIN_INVESTMENT);
      setPrincipalInput(String(MIN_INVESTMENT));
      return;
    }

    let normalizedValue = Number(principalInput);
    if (normalizedValue < MIN_INVESTMENT) normalizedValue = MIN_INVESTMENT;
    if (normalizedValue > MAX_INVESTMENT) normalizedValue = MAX_INVESTMENT;

    setPrincipal(normalizedValue);
    setPrincipalInput(String(normalizedValue));
  };

  const downloadCSV = () => {
    const headers = ['Cycle', 'Start Balance', 'Gain (6.8%)', 'Reinvested', 'Withdrawn', 'End Balance'];
    const rows = results.stages.map((s) =>
      [s.stageNumber, s.principalAtStart.toFixed(2), s.gainAmount.toFixed(2), s.reinvested.toFixed(2), s.withdrawn.toFixed(2), s.principalAtEnd.toFixed(2)].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investment_projection.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInvest = () => {
    const payload = {
      initialInvestment: principal,
      cycles,
      reinvestmentEnabled: isReinvesting,
      reinvestmentPercentage: reinvestPercentage,
      calculatedAt: Date.now(),
    };
    sessionStorage.setItem('calculatorData', JSON.stringify(payload));

    fetch(`${getApiBase()}/api/investments/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initialInvestment: principal,
        cycles,
        reinvestmentEnabled: isReinvesting,
        reinvestmentPercentage: reinvestPercentage,
      }),
    }).catch(() => {});

    onInvest(principal);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gold-50 text-[#d4af37] rounded-full flex items-center justify-center">
          <CalculatorIcon size={20} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            {lang === 'ru' ? 'Калькулятор дохода' : 'Yield Calculator'}
          </h2>
          <p className="text-stone-500 text-sm">
            {lang === 'ru' ? 'Спрогнозируйте доход с реинвестированием' : 'Project your returns with compound interest'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="luxury-card p-6 sticky top-24">
            <h3 className="font-serif font-bold text-xl mb-6 text-stone-900">
              {lang === 'ru' ? 'Параметры' : 'Parameters'}
            </h3>

            <div className="mb-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                {lang === 'ru' ? 'Сумма инвестиции' : 'Investment Amount'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-serif italic">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={principalInput}
                  onChange={handlePrincipalChange}
                  onBlur={handleBlurPrincipal}
                  className="input-luxury pl-8 pr-4 py-3 text-lg font-bold text-stone-900"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-stone-400">
                <span>Min: {formatCompact(MIN_INVESTMENT)}</span>
                <span>Max: {formatCompact(MAX_INVESTMENT)}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {lang === 'ru' ? 'Длительность (циклы)' : 'Duration (Cycles)'}
                </label>
                <span className="text-sm font-bold text-[#d4af37]">{cycles} {lang === 'ru' ? 'циклов' : 'Cycles'}</span>
              </div>
              <input
                type="range"
                min={1}
                max={MAX_CYCLES}
                value={cycles}
                onChange={(e) => setCycles(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
              <p className="text-right text-xs text-stone-400 mt-1">~{cycles * CYCLE_DAYS} {lang === 'ru' ? 'дней' : 'Days'}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {lang === 'ru' ? 'Реинвестирование' : 'Compound Interest'}
                </label>
                <button
                  onClick={() => setIsReinvesting(!isReinvesting)}
                  className={cn(
                    'w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out',
                    isReinvesting ? 'bg-[#d4af37]' : 'bg-stone-200'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out',
                      isReinvesting ? 'translate-x-6' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {isReinvesting && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-stone-500">{lang === 'ru' ? 'Процент реинвестирования' : 'Reinvestment Rate'}</span>
                    <span className="text-sm font-bold text-[#d4af37]">{reinvestPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={reinvestPercentage}
                    onChange={(e) => setReinvestPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                  />
                </motion.div>
              )}
            </div>

            <button
              onClick={handleInvest}
              className="w-full py-4 bg-[#d4af37] hover:bg-[#aa8a2e] text-black font-bold rounded-2xl uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight size={20} />
              {lang === 'ru' ? 'Инвестировать' : 'Invest'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col gap-6">
            <div
              className="luxury-card p-6 flex flex-col justify-between group hover:border-[#d4af37]/30 transition-colors cursor-pointer"
              onClick={() => setShowTableModal(true)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-50 rounded-lg text-stone-400 group-hover:text-[#d4af37] transition-colors">
                      <Table size={20} />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {lang === 'ru' ? 'Детальная таблица' : 'Detailed Breakdown'}
                    </h3>
                  </div>
                  <Maximize2 size={16} className="text-stone-300 group-hover:text-[#d4af37] transition-colors" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">{lang === 'ru' ? 'Всего циклов' : 'Total Cycles'}</span>
                    <span className="font-bold text-stone-900">{results.stages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">{lang === 'ru' ? 'Значение последнего цикла' : 'Last Cycle Value'}</span>
                    <span className="font-bold text-[#d4af37]">{formatCompact(results.finalValue)}</span>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full py-2 bg-stone-50 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-wide group-hover:bg-[#d4af37] group-hover:text-white transition-colors">
                {lang === 'ru' ? 'Таблица данных' : 'View Data Table'}
              </button>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="luxury-card p-6 border-t-4 border-t-stone-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-stone-50 rounded-lg text-stone-400">
                  <DollarSign size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {lang === 'ru' ? 'Начальный капитал' : 'Principal Capital'}
                </p>
              </div>
              <p className="text-2xl font-serif font-bold text-stone-900">{formatCompact(results.totalInvested)}</p>
              <p className="text-xs text-stone-400 mt-1">{lang === 'ru' ? 'Начальный депозит' : 'Initial Deposit'}</p>
            </div>

            <div className="luxury-card p-6 border-t-4 border-t-[#d4af37]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-lg text-[#d4af37]">
                  <TrendingUp size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {lang === 'ru' ? 'Итого' : 'Total Value'}
                </p>
              </div>
              <p className="text-2xl font-serif font-bold text-stone-900">
                {formatCompact(results.finalValue + results.totalWithdrawn)}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'ru' ? 'Активы + Выведенная прибыль' : 'Assets + Withdrawn Profit'}
              </p>
            </div>

            <div className="luxury-card p-6 border-t-4 border-t-green-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <RefreshCw size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {lang === 'ru' ? 'Чистая прибыль' : 'Net Profit'}
                </p>
              </div>
              <p className="text-2xl font-serif font-bold text-green-600">+{formatCompact(results.totalGains)}</p>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'ru' ? 'Выведено' : 'Withdrawn'}: {formatCompact(results.totalWithdrawn)}
              </p>
            </div>

            <div className="luxury-card p-6 border-t-4 border-t-blue-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ROI</p>
              </div>
              <p className="text-2xl font-serif font-bold text-blue-600">{results.roi.toFixed(2)}%</p>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'ru' ? 'Множитель' : 'Multiplier'}: {results.multiplier.toFixed(2)}x
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTableModal && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-white z-[101] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white safe-area-top">
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                {lang === 'ru' ? 'Детальная таблица' : 'Detailed Breakdown'}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#d4af37] hover:text-[#aa8a2e] transition-colors"
                >
                  <Download size={16} />
                  {lang === 'ru' ? 'Экспорт CSV' : 'Export CSV'}
                </button>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-0 bg-stone-50/30">
              <div className="max-w-7xl mx-auto w-full">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-50 text-stone-500 font-medium text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4">{lang === 'ru' ? 'Цикл' : 'Cycle'}</th>
                      <th className="px-6 py-4">{lang === 'ru' ? 'Нач. баланс' : 'Start Balance'}</th>
                      <th className="px-6 py-4 text-green-600">Gain (6.8%)</th>
                      <th className="px-6 py-4 text-amber-600">{lang === 'ru' ? 'Реинвест.' : 'Reinvested'}</th>
                      <th className="px-6 py-4">{lang === 'ru' ? 'Выведено' : 'Withdrawn'}</th>
                      <th className="px-6 py-4">{lang === 'ru' ? 'Конец баланс' : 'End Balance'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {results.stages.map((stage) => (
                      <tr key={stage.stageNumber} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-stone-900">#{stage.stageNumber}</td>
                        <td className="px-6 py-4 text-stone-600">{formatCurrency(stage.principalAtStart)}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">+{formatCurrency(stage.gainAmount)}</td>
                        <td className="px-6 py-4 text-amber-600">{formatCurrency(stage.reinvested)}</td>
                        <td className="px-6 py-4 text-stone-500">{formatCurrency(stage.withdrawn)}</td>
                        <td className="px-6 py-4 font-bold text-stone-900">{formatCurrency(stage.principalAtEnd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
