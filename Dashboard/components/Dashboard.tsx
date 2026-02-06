
import React, { useState, useEffect } from 'react';
import { User, Contract, InvestmentCycle } from '../types';
import { calculateProfit, formatCurrency, getNextCycle, parseDate } from '../services/calcService';
import { locales } from '../locales';
import { INVESTMENT_CYCLES_2026 } from '../constants';

interface DashboardProps {
  user: User;
  contract: Contract;
  lang: 'en' | 'ru';
}

const Dashboard: React.FC<DashboardProps> = ({ user, contract, lang }) => {
  const [amount, setAmount] = useState<string>('');
  const [profitData, setProfitData] = useState({ cyclesCount: 0, totalBalance: 0, profit: 0 });
  const [nextCycle, setNextCycle] = useState<InvestmentCycle | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isContractExpanded, setIsContractExpanded] = useState(false);
  const t = locales[lang];

  const openWalletApp = () => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:5175' : 'https://ipg-invest.ae/wallet';
    window.location.href = base;
  };

  const handleActivateContract = () => {
    const base =
      (window as any).__IPG_PAYMENT_URL || 'https://payment-gateway.example.com/activate';
    const url = `${base}?uid=${encodeURIComponent(user.investorId)}&contract=${encodeURIComponent(
      contract.number
    )}`;
    window.location.href = url;
  };

  useEffect(() => {
    // All metrics are derived from the 'contract' prop (our simulated database)
    const data = calculateProfit(contract.amount, contract.startDate);
    setProfitData(data);
    
    setNextCycle(getNextCycle());
  }, [contract]);

  const handleTransaction = (type: 'deposit' | 'withdraw') => {
    if (!amount) return;
    window.location.href = `https://payment-gateway.example.com/checkout?type=${type}&amount=${amount}&uid=${user.investorId}`;
  };

  const handleDownloadContract = () => {
    const contractText = `
INVESTMENT AGREEMENT
№ ${contract.number}
Dubai, UAE | Date: ${contract.startDate}

1. TERMS AND DEFINITIONS
1.1. Investor – ${user.email} (IIN: ${user.investorId})
1.2. The recipient of investments is Imperial Pure Gold DMCC.
... [Full Agreement Content Based on Provided Screenshots] ...

3. DURATION
3.1. Valid until ${contract.endDate}.

4. INVESTMENT AMOUNT
4.1. The fixed amount of investment: ${formatCurrency(contract.amount)}
    `;

    const blob = new Blob([contractText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Investment_Agreement_${contract.number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isCycleActive = (dateStr: string) => {
    const cycleDate = parseDate(dateStr);
    const cutoffDate = new Date(cycleDate.getTime() - 24 * 60 * 60 * 1000);
    return new Date() < cutoffDate;
  };

  // Logic: Active if funds are present in the mock DB, otherwise pending
  const isPendingActivation = contract.amount <= 0;
  const contractStatusText = isPendingActivation ? t.statusPendingActivation : t.statusActive;
  const contractStatusClass = contract.amount > 0 
    ? 'bg-green-100/80 text-green-700 ring-green-200' 
    : 'bg-amber-100/80 text-amber-700 ring-amber-200';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-xl md:text-2xl font-black text-gray-900 mb-1 tracking-tight">{t.welcome}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.accId}:</span>
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md tracking-tighter">{user.investorId}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-gray-50/50 p-3 md:p-4 rounded-2xl border border-gray-100 w-full md:w-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl gold-gradient flex items-center justify-center text-white text-lg shadow-lg">
            <i className="fa-solid fa-crown"></i>
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest">{t.status}</p>
            <p className="text-xs md:text-sm font-bold text-gray-800">{t.verified}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Yield Widget */}
        <div className="luxury-card p-6 md:p-7 rounded-[2rem] flex flex-col justify-between min-h-[160px] md:min-h-[200px] shadow-sm hover:shadow-md border-green-100/30">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] md:text-xs uppercase font-black text-gray-400 tracking-widest">{t.yieldAllTime}</span>
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
              <i className="fa-solid fa-chart-line text-sm"></i>
            </div>
          </div>
          <div className="text-center py-2">
            <h2 className="text-2xl md:text-4xl font-black text-green-600 tracking-tight">+{formatCurrency(profitData.profit)}</h2>
            <p className="text-[10px] md:text-xs text-gray-400 font-black mt-2 uppercase tracking-widest">
              {lang === 'ru' ? `${profitData.cyclesCount} активных циклов` : `${profitData.cyclesCount} active cycles`}
            </p>
          </div>
          <div className="h-4"></div>
        </div>

        {/* Token Balance Widget */}
        <div className="luxury-card p-6 md:p-7 rounded-[2rem] flex flex-col justify-between min-h-[160px] md:min-h-[200px] shadow-sm hover:shadow-md border-amber-100/30">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] md:text-xs uppercase font-black text-gray-400 tracking-widest">{t.tokenBalance}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
              <i className="fa-solid fa-coins text-sm"></i>
            </div>
          </div>
          <div className="text-center py-2">
            <div className="flex items-baseline justify-center space-x-1.5">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">{user.tokenBalance.toLocaleString()}</h2>
              <span className="text-xs font-black text-gray-300 uppercase tracking-widest">IPG</span>
            </div>
            <button
              type="button"
              onClick={openWalletApp}
              className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest mt-4 transition-colors"
            >
              {t.manageWallet} <i className="fa-solid fa-chevron-right text-[8px]"></i>
            </button>
          </div>
          <div className="h-4"></div>
        </div>

        {/* Fund Management */}
        <div className="luxury-card p-6 md:p-7 rounded-[2rem] sm:col-span-2 lg:col-span-1 shadow-sm border-amber-100/50">
          <span className="text-[10px] md:text-xs uppercase font-black text-gray-400 tracking-widest block mb-5">{t.capitalManagement}</span>
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm group-focus-within:text-amber-500 transition-colors">$</span>
              <input 
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.amountPlaceholder}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-8 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleTransaction('deposit')}
                disabled={!amount}
                className="bg-black text-white py-4 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-black/10"
              >
                {t.deposit}
              </button>
              <button 
                onClick={() => handleTransaction('withdraw')}
                disabled={!amount}
                className="bg-white border-2 border-gray-100 text-gray-800 py-4 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30"
              >
                {t.withdraw}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col group/contract">
          <div className="bg-gray-50/50 px-6 md:px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-600">
                <i className="fa-solid fa-file-signature text-sm"></i>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-gray-800">{t.activeContract}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-[9px] uppercase font-black tracking-widest ring-1 ${contractStatusClass}`}>
                {contractStatusText}
              </span>
              {isPendingActivation && (
                <button
                  type="button"
                  onClick={handleActivateContract}
                  className="px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-widest bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  {t.activate}
                </button>
              )}
            </div>
          </div>
          
          <div className={`grid transition-all duration-500 ease-in-out ${isContractExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-10">
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.contractNum}</p>
                    <p className="text-base md:text-lg font-black text-gray-900 tracking-tight">{contract.number}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.principal}</p>
                    <p className="text-base md:text-lg font-black text-gray-900 tracking-tight">{formatCurrency(contract.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.activationDate}</p>
                    <p className="text-base md:text-lg font-black text-gray-900 tracking-tight">{contract.startDate}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.maturityDate}</p>
                    <p className="text-base md:text-lg font-black text-gray-900 tracking-tight">{contract.endDate}</p>
                  </div>
                </div>
                <div className="mt-10">
                  <button 
                    onClick={handleDownloadContract}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-amber-500 text-gray-950 px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <i className="fa-solid fa-file-pdf text-base"></i>
                    {t.downloadTemplate}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Toggle Button at the bottom middle */}
          <div className="flex justify-center py-4 border-t border-gray-50 bg-gray-50/20">
            <button 
              onClick={() => setIsContractExpanded(!isContractExpanded)}
              className="flex flex-col items-center gap-1.5 group/btn active:scale-95 transition-transform"
            >
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 group-hover/btn:text-amber-700 transition-colors">
                {t.details}
              </span>
              <div className={`w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 transition-all duration-500 shadow-sm group-hover/btn:bg-amber-100 group-hover/btn:shadow-md ${isContractExpanded ? 'rotate-180' : ''}`}>
                <i className="fa-solid fa-chevron-down text-[10px]"></i>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Opportunity */}
        <div className="bg-gray-900 text-white p-7 md:p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[280px]">
           {nextCycle ? (
             <>
               <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">Next Opportunity</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black mb-4 leading-tight tracking-tight">{t.cycleOpening(nextCycle.number)}</h4>
                  <p className="text-gray-400 text-xs md:text-sm mb-8 leading-relaxed font-medium">
                    {t.cycleDesc(nextCycle.date)}
                  </p>
               </div>
               <button 
                onClick={() => setIsScheduleOpen(true)}
                className="relative z-10 bg-amber-500 text-gray-950 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                 {t.viewSchedule}
               </button>
             </>
           ) : (
             <div className="relative z-10">
               <h4 className="text-xl font-black mb-2">{lang === 'ru' ? 'Все циклы завершены' : 'All cycles completed'}</h4>
               <p className="text-gray-400 text-xs">{lang === 'ru' ? 'Следите за обновлениями на 2027 год.' : 'Stay tuned for 2027 updates.'}</p>
               <button 
                onClick={() => setIsScheduleOpen(true)}
                className="mt-6 bg-white/10 text-white w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
               >
                 {t.viewSchedule}
               </button>
             </div>
           )}
           <i className="fa-solid fa-gem absolute -right-2 top-10 text-[120px] text-white/5 pointer-events-none rotate-12"></i>
        </div>
      </div>

      {/* Cycle Schedule Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsScheduleOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">{t.viewSchedule}</h3>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-0.5">Investment Cycles 2026</p>
              </div>
              <button 
                onClick={() => setIsScheduleOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-sm transition-all"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-2 md:p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 divide-y divide-gray-50">
                {INVESTMENT_CYCLES_2026.map((cycle) => {
                  const active = isCycleActive(cycle.date);
                  return (
                    <div key={cycle.number} className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${active ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-100 text-gray-400'}`}>
                          #{cycle.number}
                        </div>
                        <div>
                          <p className={`text-sm font-black ${active ? 'text-gray-900' : 'text-gray-300'}`}>{cycle.date}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Fixed Yield Cycle</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {active ? (
                          <span className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {lang === 'ru' ? 'Доступен' : 'Available'}
                          </span>
                        ) : (
                          <span className="text-gray-300 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {lang === 'ru' ? 'Завершен' : 'Closed'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-circle-info text-amber-500 mt-0.5"></i>
                <p className="text-[10px] md:text-xs text-gray-400 font-medium leading-relaxed">
                  {lang === 'ru' 
                    ? 'Средства должны быть внесены минимум за 24 часа до даты открытия цикла для участия в распределении доходности 6.8%.'
                    : 'Funds must be deposited at least 24 hours before the cycle opening date to participate in the 6.8% yield distribution.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
