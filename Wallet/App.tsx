import React, { useMemo, useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { LegalModal } from './shared/LegalModal';
import PriceChart from './components/PriceChart';
import { ArrowUpRight, ArrowDownLeft, Wallet, Info, ChevronLeft, ChevronRight, Copy, CheckCircle, Send, User, MessageCircle, Facebook } from 'lucide-react';
import { Language, TimeRange, Transaction, WalletState, ChartDataPoint } from './types';
import { TRANSLATIONS } from './constants';

type AppProps = {
  apiBase?: string;
  userId?: string;
};

const resolveApiBase = (apiBase?: string) => {
  if (apiBase) return apiBase.replace(/\/$/, '');
  const runtimeBase = (window as any).__IPG_API_BASE as string | undefined;
  if (runtimeBase) return String(runtimeBase).replace(/\/$/, '');
  const host = window.location.hostname;
  const isLocalLike =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  return isLocalLike ? `http://${host}:3001` : 'https://api.ipg-invest.ae';
};

const mapTxType = (type: string): Transaction['type'] => {
  switch (type) {
    case 'DEPOSIT':
    case 'GHS_PURCHASE':
      return 'BUY';
    case 'WITHDRAWAL':
      return 'WITHDRAW';
    case 'PROFIT_ACCRUAL':
    case 'GHS_BONUS':
      return 'BONUS';
    default:
      return 'FEE';
  }
};

const mapTxStatus = (status: string): Transaction['status'] => {
  switch (status) {
    case 'completed':
      return 'COMPLETED';
    case 'pending':
      return 'PENDING';
    case 'failed':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
};

const App: React.FC<AppProps> = ({ apiBase, userId }) => {
  // Global State
  const [lang, setLang] = useState<Language>('EN');
  const [range, setRange] = useState<TimeRange>('1M');
  
  // Data State
  const [wallet, setWallet] = useState<WalletState>({
    balance: 12500.00,
    currency: 'USD',
    goldEquivalentOz: 6.75,
    address: null,
    isConnected: false
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [priceHistory, setPriceHistory] = useState<ChartDataPoint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // UI State
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [withDrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'risks' | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const run = async () => {
      const base = resolveApiBase(apiBase);
      const resolvedUserId = userId || '1';
      try {
        const [balancesRes, txRes, priceRes] = await Promise.all([
          fetch(`${base}/balances?userId=${resolvedUserId}`),
          fetch(`${base}/transactions?userId=${resolvedUserId}&limit=100`),
          fetch(`${base}/token-price-history?limit=200`)
        ]);

        if (balancesRes.ok) {
          const balances = await balancesRes.json();
          const ghsBalance = balances.find((b: any) => b.currency === 'GHS')?.amount || 0;
          setWallet((prev) => ({
            ...prev,
            balance: Number(ghsBalance) || 0,
            goldEquivalentOz: Math.max(0, Number(ghsBalance) / 1000)
          }));
        }

        if (txRes.ok) {
          const txs = await txRes.json();
          const mapped: Transaction[] = txs.map((tx: any) => {
            const mappedType = mapTxType(tx.type);
            const rawAmount = Number(tx.amount) || 0;
            const amount = mappedType === 'WITHDRAW' ? -Math.abs(rawAmount) : rawAmount;
            return {
            id: String(tx.id),
            date: new Date(tx.created_at).toLocaleString('ru-RU'),
              type: mappedType,
              amount,
            status: mapTxStatus(tx.status),
            comment: tx.comment || undefined
            };
          });
          setTransactions(mapped);
        }

        if (priceRes.ok) {
          const prices = await priceRes.json();
          const mapped = prices
            .slice()
            .reverse()
            .map((p: any) => ({
              date: new Date(p.timestamp).toLocaleDateString('ru-RU'),
              price: Number(p.price_usd) || 0
            }));
          setPriceHistory(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    };

    run();
  }, [apiBase, userId]);

  const chartData = useMemo(() => {
    if (!priceHistory.length) return undefined;
    const size = range === '1D' ? 24 : range === '1W' ? 7 : range === '1Y' ? 12 : 30;
    const slice = priceHistory.slice(-size);
    return slice.length ? slice : undefined;
  }, [priceHistory, range]);

  // Derived Values
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleConnectWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address: '0x71C...9A23'
      }));
      setIsConnecting(false);
      setIsWalletModalOpen(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setWallet(prev => ({
      ...prev,
      isConnected: false,
      address: null
    }));
  };

  const openWithdrawModal = () => {
    setWithdrawModalOpen(true);
  };

  const redirectToPayment = () => {
    // Simulating external payment gateway
    window.open('https://example.com/payment-gateway', '_blank');
  };

  const openManagerChat = () => {
    window.open('https://t.me/GoldenShareClub', '_blank');
    setWithdrawModalOpen(false);
  };
  const walletComingSoon = true;

  const renderComingSoonStub = () => (
    <main className="flex-1 pt-24 pb-20 px-4 md:px-12 max-w-[1000px] mx-auto w-full z-10 relative">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
        <h1 className="text-3xl md:text-5xl font-playfair font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8c2c] mb-8">
          Coming soon
        </h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/40">Wallet</th>
                <th className="py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-4 text-sm text-white/80">Wallet App</td>
                <td className="py-4 text-sm font-bold text-[#d4af37]">Coming soon</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#141417] font-sans selection:bg-[#d4af37] selection:text-black">
      
      <Header 
        lang={lang} 
        setLang={setLang}
        onManagerClick={() => setIsManagerModalOpen(true)}
      />

      {/* Main Content Area - Pushed down by fixed header (40px + 80px = 120px) */}
      {walletComingSoon ? renderComingSoonStub() : (
      <main className="flex-1 pt-24 pb-20 px-4 md:px-12 max-w-[1400px] mx-auto w-full z-10 relative">
        
        {/* Decorative Background Elements */}
        <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Wallet Card & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Balance Card */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl group hover:border-[#d4af37]/30 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] z-0 transition-all duration-500 group-hover:bg-[#d4af37]/10" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-black/30 rounded-2xl border border-white/5">
                    <Wallet className="text-[#d4af37]" size={24} />
                  </div>
                  {wallet.isConnected ? (
                     <div className="flex items-center gap-2 px-3 py-1 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/20">
                       <span className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
                       <span className="text-[10px] font-mono text-[#d4af37]">{wallet.address}</span>
                       <button onClick={handleDisconnect} className="ml-2 text-white/40 hover:text-white"><XIcon size={12} /></button>
                     </div>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-white/30">Not Connected</span>
                  )}
                </div>

                <div className="space-y-1 mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{t.balanceTitle}</span>
                  <h1 className="text-4xl md:text-5xl font-playfair font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8c2c]">
                    {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-lg text-[#d4af37]/80">GHS</span>
                  </h1>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-white/40">USD Value</span>
                    <span className="text-lg font-bold text-white/90">${(wallet.balance * 1.05).toLocaleString()}</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-white/40">{t.goldEquiv}</span>
                    <span className="text-lg font-bold text-white/90">{wallet.goldEquivalentOz} <span className="text-xs text-[#d4af37]">OZ</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={redirectToPayment}
                className="group relative overflow-hidden p-4 rounded-2xl bg-[#d4af37] text-black border border-[#d4af37] transition-all hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)]"
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="p-2 bg-black/10 rounded-full group-hover:scale-110 transition-transform">
                    <ArrowDownLeft size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.walletActions.deposit}</span>
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              <button 
                onClick={openWithdrawModal}
                className="group relative overflow-hidden p-4 rounded-2xl bg-white/5 text-white border border-white/10 transition-all hover:border-white/30 hover:bg-white/10"
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="p-2 bg-white/5 rounded-full group-hover:scale-110 transition-transform text-[#d4af37]">
                    <ArrowUpRight size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.walletActions.withdraw}</span>
                </div>
              </button>
              
              <button 
                onClick={() => setIsWalletModalOpen(true)}
                className="col-span-2 group relative overflow-hidden p-4 rounded-2xl bg-white/5 text-white border border-white/10 transition-all hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5"
              >
                 <div className="relative z-10 flex flex-row items-center justify-center gap-3">
                    <Wallet size={18} className={wallet.isConnected ? "text-green-400" : "text-white/40"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {wallet.isConnected ? t.walletActions.disconnect : t.walletActions.connect}
                    </span>
                 </div>
              </button>
            </div>
          </div>

          {/* Center/Right: Chart & History */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Chart Component */}
            <PriceChart range={range} setRange={setRange} lang={lang} data={chartData} />

            {/* Transaction History Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
                  {t.history.title}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/40">{t.history.colDate}</th>
                      <th className="py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/40">{t.history.colType}</th>
                      <th className="py-4 text-right text-[10px] font-bold uppercase tracking-widest text-white/40">{t.history.colAmount}</th>
                      <th className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">{t.history.colStatus}</th>
                      <th className="py-4 text-right text-[10px] font-bold uppercase tracking-widest text-white/40">{t.history.colComment}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((tx) => (
                      <tr key={tx.id} className="group border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-xs font-medium text-white/70">{tx.date}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            tx.type === 'BONUS' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                            tx.type === 'BUY' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                            tx.type === 'WITHDRAW' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                            'border-white/20 text-white/60'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-4 text-right text-xs font-bold ${tx.amount > 0 ? 'text-[#d4af37]' : 'text-white/60'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} GHS
                        </td>
                        <td className="py-4 text-center">
                          {tx.status === 'COMPLETED' ? <CheckCircle size={14} className="text-green-500 mx-auto" /> :
                           tx.status === 'PENDING' ? <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /> :
                           <div className="w-2 h-2 bg-red-500 rounded-full mx-auto" />}
                        </td>
                        <td className="py-4 text-right text-[10px] text-white/40 italic">{tx.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      )}

      {/* Modals */}
      
      {/* Withdraw Modal */}
      {withDrawModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c21] border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
            <button onClick={() => setWithdrawModalOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><XIcon size={20}/></button>
            <h3 className="text-xl font-playfair font-bold text-white mb-4">Withdraw Funds</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              To process a withdrawal securely, please contact your personal manager directly via Telegram. They will verify your identity and process the transaction.
            </p>
            <button onClick={openManagerChat} className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-[#b59226] transition-colors flex items-center justify-center gap-2">
              <Send size={18} /> Contact Manager
            </button>
          </div>
        </div>
      )}

      {/* Manager Modal */}
      {isManagerModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c21] border border-white/10 p-8 rounded-3xl max-w-sm w-full relative text-center">
            <button onClick={() => setIsManagerModalOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><XIcon size={20}/></button>
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <User size={32} className="text-[#d4af37]" />
            </div>
            <h3 className="text-xl font-playfair font-bold text-white mb-2">{lang === 'ru' ? 'Свяжитесь с нами' : 'Contact Us'}</h3>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-8">{lang === 'ru' ? 'Контакты проекта и менеджера' : 'Project and manager contacts'}</p>
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 text-left">
                {lang === 'ru' ? 'Контакты проекта' : 'Project contacts'}
              </div>
              <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 border-r border-white/10 text-[#229ED9] hover:bg-[#229ED9]/20 transition-all">
                  <Send size={16} /> Telegram
                </a>
                <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 text-[#1877f2] hover:bg-[#1877f2]/20 transition-all">
                  <Facebook size={16} /> Facebook
                </a>
              </div>
              <div className="pt-2 text-[10px] font-bold uppercase tracking-widest text-white/40 text-left">
                {lang === 'ru' ? 'Ваш Персональный Менеджер' : 'Your Personal Manager'}
              </div>
              <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 border-r border-white/10 text-[#229ED9] hover:bg-[#229ED9]/20 transition-all">
                  <Send size={16} /> Telegram
                </a>
                <a href="https://api.whatsapp.com/send/?phone=447776177435&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 text-[#25D366] hover:bg-[#25D366]/20 transition-all">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connect Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c21] border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
             <button onClick={() => setIsWalletModalOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><XIcon size={20}/></button>
             <h3 className="text-xl font-playfair font-bold text-white mb-6">Connect Wallet</h3>
             
             {!wallet.isConnected ? (
                <div className="space-y-4">
                  <button 
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500">
                          <Wallet size={20} />
                       </div>
                       <div className="text-left">
                          <div className="font-bold text-white">MetaMask</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">Ethereum / BSC</div>
                       </div>
                    </div>
                    {isConnecting && <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />}
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group opacity-50 cursor-not-allowed">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-500">
                          <Wallet size={20} />
                       </div>
                       <div className="text-left">
                          <div className="font-bold text-white">WalletConnect</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">Coming Soon</div>
                       </div>
                    </div>
                  </button>
                </div>
             ) : (
                <div className="text-center">
                   <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                      <CheckCircle size={32} />
                   </div>
                   <h4 className="text-lg font-bold text-white mb-2">Connected Successfully</h4>
                   <p className="text-white/40 text-xs font-mono bg-black/30 p-2 rounded mb-6">{wallet.address}</p>
                   <button onClick={handleDisconnect} className="text-red-400 hover:text-red-300 text-xs uppercase tracking-widest underline">
                      Disconnect Wallet
                   </button>
                </div>
             )}
          </div>
        </div>
      )}

      <Footer lang={lang} onLegalClick={(type) => setLegalModal(type)} />
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

// Helper icon for Close buttons
const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default App;
