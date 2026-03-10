import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, FileText, Download, TrendingUp, X, Calendar, ChevronRight } from 'lucide-react';
import { formatCurrency, calculateYield, getNextCycle, getCutoffDate, isCycleActive, INVESTMENT_CYCLES_2026, formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import { User, Contract } from '../types';
import { formatDate as formatDateStr } from '../services/calcService';
import { locales } from '../locales';
import { useHeaderVisibility } from '../context/HeaderVisibilityContext';

interface ApiCycle {
  id: number;
  cycle_number: number;
  cycle_date: string;
  yield_rate: number;
}

const TELEGRAM_MANAGER = 'IPG_Mark'; // Менеджер для запросов на вывод

interface DashboardProps {
  user: User;
  contract: Contract;
  lang: 'en' | 'ru';
  isPending?: boolean;
  prefillAmount?: number | null;
  serverYield?: { balance: number; profit: number; cyclesApplied: number; cyclesLeft: number; nextCycle?: { id: number; date: Date; yield_rate: number } } | null;
  apiCycles?: ApiCycle[];
  onTriggerKYC: () => void;
  onStartFunding: (source: 'deposit' | 'activate', amount?: number) => void;
  onOpenPayment?: (amount: number) => void;
}

const t = (lang: 'en' | 'ru') => locales[lang];

export function DashboardPage({ user, contract, lang, isPending = false, prefillAmount = null, serverYield, apiCycles = [], onTriggerKYC, onStartFunding, onOpenPayment }: DashboardProps) {
  const [amount, setAmount] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isContractExpanded, setIsContractExpanded] = useState(false);
  const capitalManagementRef = React.useRef<HTMLDivElement | null>(null);
  const { setModalOverlay } = useHeaderVisibility() ?? { setModalOverlay: () => {} };

  useEffect(() => {
    setModalOverlay('cycles', isScheduleOpen);
    return () => setModalOverlay('cycles', false);
  }, [isScheduleOpen, setModalOverlay]);

  useEffect(() => {
    if (!prefillAmount || !Number.isFinite(prefillAmount) || prefillAmount <= 0) return;
    setAmount(String(prefillAmount));
    capitalManagementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [prefillAmount]);

  const principal = contract.amount || 0;
  const clientYieldData = calculateYield(principal, new Date(contract.startDate));
  const yieldData = serverYield
    ? { profit: serverYield.profit, cyclesLeft: serverYield.cyclesLeft, nextCycle: serverYield.nextCycle?.date ?? null }
    : { profit: clientYieldData.profit, cyclesLeft: clientYieldData.cyclesLeft, nextCycle: clientYieldData.nextCycle };
  const nextCycle = serverYield?.nextCycle
    ? { id: serverYield.nextCycle.id, date: serverYield.nextCycle.date, yield_rate: serverYield.nextCycle.yield_rate }
    : getNextCycle();

  const displayCycles = apiCycles.length > 0
    ? apiCycles.map((c) => ({ id: c.cycle_number, number: c.cycle_number, date: new Date(c.cycle_date), yield_rate: c.yield_rate }))
    : INVESTMENT_CYCLES_2026;

  const openWalletApp = () => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5177' : 'https://wallet.ipg-invest.ae';
    window.location.href = base;
  };

  const handleDepositClick = () => {
    if (!user.emailVerified && !isPending) {
      onTriggerKYC();
      return;
    }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      return;
    }
    if (onOpenPayment) {
      onOpenPayment(parsed);
    } else {
      onStartFunding('deposit', parsed);
    }
  };

  const handleWithdrawClick = () => {
    if (!user.emailVerified || isPending) return;
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return;
    const wallet = user.cryptoWallet || (user as any).cryptoWallet || '';
    const msg = `Запрос на вывод\nСумма: $${parsed.toLocaleString()}\nКошелёк: ${wallet || 'не указан'}`;
    const url = `https://t.me/${TELEGRAM_MANAGER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleActivateContract = () => {
    if (!user.emailVerified && !isPending) {
      onTriggerKYC();
      return;
    }
    onStartFunding('activate');
  };

  const handleDownloadContract = () => {
    const text = `
INVESTMENT AGREEMENT
№ ${contract.number}
Dubai, UAE | Date: ${contract.startDate}

1. Investor – ${user.email}${user.investorId ? ` (IIN: ${user.investorId})` : ''}
2. Duration: until ${contract.endDate}
3. Investment Amount: ${formatCurrency(contract.amount)}
    `;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Investment_Agreement_${contract.number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isPendingActivation = contract.amount <= 0;
  const fullName = (user.fullName || '').split(' ');
  const firstName = fullName[0] || 'Investor';

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">{t(lang).dashboard}</h2>
            <span className="px-4 py-2 bg-[#d4af37]/15 text-[#d4af37] rounded-xl text-sm font-bold uppercase tracking-wide border border-[#d4af37]/30 flex items-center gap-2">
              {t(lang).totalFunds}: {formatCurrency(principal)}
            </span>
            {user.emailVerified ? (
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-green-100 flex items-center gap-1">
                <ChevronRight size={12} />
                {t(lang).verified}
              </span>
            ) : (
              <button
                onClick={onTriggerKYC}
                className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1 animate-pulse"
              >
                {lang === 'ru' ? 'Пройти верификацию' : 'Verify Identity'}
                <ChevronRight size={12} />
              </button>
            )}
          </div>
          {user.investorId && (
            <p className="text-stone-500 font-mono text-xs tracking-widest">{t(lang).accId}: {user.investorId}</p>
          )}
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{lang === 'ru' ? 'Текущая дата' : 'Current Date'}</p>
          <p className="font-serif text-lg text-stone-900">{new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <TrendingUp size={16} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).yieldAllTime}</p>
            </div>
            <h3 className="text-4xl font-serif font-bold text-stone-900 mb-2">
              {formatCurrency(yieldData.profit)}
            </h3>
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-bold">
                +{principal > 0 ? (yieldData.profit / principal * 100).toFixed(1) : 0}%
              </span>
              <span className="text-xs text-gray-400">{lang === 'ru' ? 'За всё время' : 'All time return'}</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${Math.min(100, yieldData.cyclesLeft * 7)}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right">{yieldData.cyclesLeft} {lang === 'ru' ? 'циклов осталось' : 'cycles remaining'}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="luxury-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Wallet size={120} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Wallet size={16} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).tokenBalance}</p>
              </div>
              <h3 className="text-4xl font-serif font-bold text-stone-900 mb-2">
                {user.tokenBalance.toLocaleString()} <span className="text-lg text-amber-600">IPG</span>
              </h3>
              <p className="text-xs text-gray-400">≈ ${(user.tokenBalance * 1.24).toLocaleString()} USD</p>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); openWalletApp(); }} className="mt-6 flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-colors group/link">
              <span className="text-xs font-bold uppercase tracking-wide">{t(lang).manageWallet}</span>
              <ArrowUpRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>

        <motion.div ref={capitalManagementRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="luxury-card p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">{t(lang).capitalManagement}</p>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif italic">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t(lang).amountPlaceholder}
                className="input-luxury pl-8 pr-4 py-4 text-xl font-serif font-bold text-stone-900 placeholder:text-gray-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDepositClick}
              className="flex items-center justify-center gap-2 bg-stone-900 text-white py-3 rounded-2xl font-medium hover:bg-black active:scale-95 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50"
            >
              <ArrowDownLeft size={18} />
              {t(lang).deposit}
            </button>
            <button
              onClick={handleWithdrawClick}
              disabled={isPending}
              className="flex items-center justify-center gap-2 bg-white text-stone-900 border border-gray-200 py-3 rounded-2xl font-medium hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
            >
              <ArrowUpRight size={18} />
              {t(lang).withdraw}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="luxury-card overflow-hidden">
            <div
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsContractExpanded(!isContractExpanded)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900">{t(lang).activeContract}</h3>
                  <p className="text-xs text-gray-400">#{contract.number}</p>
                </div>
                <span className={cn(
                  "ml-auto px-3 py-1 rounded-full text-[9px] font-bold uppercase",
                  isPendingActivation ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                )}>
                  {isPendingActivation ? t(lang).statusPendingActivation : t(lang).statusActive}
                </span>
              </div>
              <ChevronRight size={20} className={cn("text-gray-400 transition-transform", isContractExpanded ? "rotate-90" : "")} />
            </div>

            <AnimatePresence>
              {isContractExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t(lang).principal}</p>
                        <p className="font-medium text-stone-900">{formatCurrency(principal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t(lang).activationDate}</p>
                        <p className="font-medium text-stone-900">{contract.startDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t(lang).maturityDate}</p>
                        <p className="font-medium text-stone-900">{contract.endDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{lang === 'ru' ? 'Ставка' : 'Rate'}</p>
                        <p className="font-medium text-green-600">
                          {(nextCycle && 'yield_rate' in nextCycle ? (nextCycle as { yield_rate: number }).yield_rate * 100 : 6.8).toFixed(1)}% / cycle
                        </p>
                      </div>
                    </div>
                    {isPendingActivation && (
                      <button
                        onClick={handleActivateContract}
                        className="mb-4 w-full py-3 rounded-2xl bg-amber-600 text-white font-bold uppercase tracking-wide hover:bg-amber-700 transition-colors"
                      >
                        {t(lang).activate}
                      </button>
                    )}
                    <button onClick={handleDownloadContract} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#d4af37] hover:text-[#aa8a2e] transition-colors">
                      <Download size={16} />
                      {t(lang).downloadTemplate}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="luxury-card p-6 relative overflow-hidden">
          {nextCycle ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{lang === 'ru' ? 'Следующая возможность' : 'Next Opportunity'}</p>
              </div>
              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                  {t(lang).cycleOpening(nextCycle.id)}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {t(lang).cycleDesc(formatDate(getCutoffDate(nextCycle.date)))}
                </p>
              </div>
              <div className="space-y-3 relative z-10">
                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wide transition-colors shadow-lg shadow-amber-600/20"
                >
                  {t(lang).viewSchedule}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Calendar size={16} className="text-gray-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).viewSchedule}</p>
              </div>
              <div className="mb-6 relative z-10">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                  {lang === 'ru' ? 'Все циклы завершены' : 'All cycles completed'}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {lang === 'ru' ? 'Следите за обновлениями на 2027 год.' : 'Stay tuned for 2027 updates.'}
                </p>
              </div>
              <div className="space-y-3 relative z-10">
                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  {t(lang).viewSchedule}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cycle Schedule Modal */}
      <AnimatePresence>
        {isScheduleOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleOpen(false)}
              className="fixed inset-0 bg-[#0c0c0e]/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 top-[5%] bottom-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-6 flex justify-between items-center bg-white z-10 relative">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">{t(lang).viewSchedule}</h3>
                  <p className="text-stone-500 text-sm mt-1">2026 Investment Calendar</p>
                </div>
                <button onClick={() => setIsScheduleOpen(false)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 pb-8 relative">
                <div className="absolute left-[47px] top-0 bottom-0 w-px bg-stone-100" />
                <div className="space-y-6 relative">
                  {displayCycles.map((cycle) => {
                    const cycleDate = cycle.date instanceof Date ? cycle.date : new Date(cycle.date);
                    const active = isCycleActive(cycleDate);
                    const isNext = nextCycle && (nextCycle as { id?: number }).id === cycle.id;
                    const isPast = !active && !isNext;
                    return (
                      <div
                        key={cycle.id}
                        className={cn(
                          "relative pl-16 py-4 pr-4 rounded-2xl border transition-all duration-300",
                          isNext ? "bg-amber-50/50 border-amber-200 shadow-lg shadow-amber-100/50 scale-[1.02]" : "bg-white border-transparent hover:bg-stone-50"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold z-10 shadow-sm transition-colors",
                            isNext ? "bg-amber-500 text-white" : active ? "bg-stone-100 text-stone-400" : "bg-stone-200 text-stone-400"
                          )}
                        >
                          {isNext ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <span>{cycle.id}</span>}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className={cn("font-serif text-lg font-bold", isNext ? "text-stone-900" : isPast ? "text-stone-400" : "text-stone-600")}>
                                    {formatDate(cycleDate)}
                                  </p>
                              {isNext && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                  {lang === 'ru' ? 'Далее' : 'Next'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                              {isNext ? (lang === 'ru' ? 'Открыто для пополнения' : 'Open for Deposit') : 'Fixed Yield Cycle'}
                              {'yield_rate' in cycle ? ` • ${((cycle as { yield_rate: number }).yield_rate * 100).toFixed(1)}%` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border",
                                isNext ? "bg-green-50 text-green-600 border-green-100" : active ? "bg-stone-50 text-stone-500 border-stone-200" : "bg-stone-100 text-stone-400 border-stone-200"
                              )}
                            >
                              {isNext ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  {lang === 'ru' ? 'Активен' : 'Active'}
                                </>
                              ) : active ? (
                                lang === 'ru' ? 'Предстоящий' : 'Upcoming'
                              ) : (
                                lang === 'ru' ? 'Завершен' : 'Closed'
                              )}
                            </span>
                          </div>
                        </div>
                        {isNext && (
                          <div className="mt-3 pt-3 border-t border-amber-100/50 flex items-center gap-2 text-xs text-amber-800/70">
                            <Calendar size={14} />
                            <span>{lang === 'ru' ? 'Дедлайн пополнения:' : 'Deposit deadline:'} <span className="font-bold">{formatDate(getCutoffDate(cycleDate))}</span></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-6 bg-stone-50 border-t border-stone-100 z-10">
                <div className="flex items-start gap-3 text-xs text-stone-500 leading-relaxed">
                  <div className="min-w-[16px] flex justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <p>
                    {lang === 'ru'
                      ? 'Средства должны быть внесены минимум за 24 часа до даты открытия цикла для участия в доходности 6.8%. Поздние пополнения будут учтены в следующем цикле.'
                      : 'Funds must be deposited at least 24 hours before the cycle opening date to participate in the 6.8% yield. Late deposits will apply to the following cycle.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
