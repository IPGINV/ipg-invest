
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TransactionHistory from './components/TransactionHistory';
import { User, Contract, AuthStatus, Transaction } from './types';
import { locales } from './locales';

type ActiveTab = 'dashboard' | 'history' | 'profile' | 'calculator' | 'project';

type AppProps = {
  apiBase?: string;
  userId?: string;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ru-RU');
};

const mapTransactionType = (type: string): Transaction['type'] => {
  switch (type) {
    case 'DEPOSIT':
    case 'GHS_PURCHASE':
      return 'deposit';
    case 'WITHDRAWAL':
      return 'withdrawal';
    case 'PROFIT_ACCRUAL':
    case 'GHS_BONUS':
      return 'yield';
    default:
      return 'deposit';
  }
};

const App: React.FC<AppProps> = ({ apiBase, userId }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.LOADING);
  const [user, setUser] = useState<User | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lang, setLang] = useState<'en' | 'ru'>('ru');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const t = locales[lang];
  const buildFallbackContract = useCallback((investorId?: string): Contract => {
    const startDate = formatDate(new Date());
    const endDate = formatDate(new Date(new Date().setMonth(new Date().getMonth() + 6)));
    return {
      number: investorId || '0000',
      amount: 0,
      startDate,
      endDate
    };
  }, []);

  const fetchUserData = useCallback(async () => {
      const base = apiBase || (window as any).__IPG_API_BASE || 
        (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.ipg-invest.ae');
      const isHost = Boolean((window as any).__IPG_HOST);
      const token = localStorage.getItem('ipg_token');
      const storedUserId = localStorage.getItem('ipg_user_id');
      const resolvedUserId = userId || storedUserId || '';

      // Всегда требуем реальный токен и userId для доступа к Dashboard
      if (!token || !resolvedUserId) {
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        if (isHost) {
          setRequiresLogin(true);
          return;
        }
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/login.html';
        }
        return;
      }
      setAuthStatus(AuthStatus.LOADING);
      try {
        const authHeaders = { Authorization: `Bearer ${token}` };
        const [userRes, balancesRes, contractsRes, txRes] = await Promise.all([
          fetch(`${base}/users/${resolvedUserId}`, { headers: authHeaders }),
          fetch(`${base}/balances?userId=${resolvedUserId}`, { headers: authHeaders }),
          fetch(`${base}/contracts?userId=${resolvedUserId}`, { headers: authHeaders }),
          fetch(`${base}/transactions?userId=${resolvedUserId}&limit=50`, { headers: authHeaders })
        ]);

        if (!userRes.ok) throw new Error('User fetch failed');

        const userData = await userRes.json();
        const balances = balancesRes.ok ? await balancesRes.json() : [];
        const contracts = contractsRes.ok ? await contractsRes.json() : [];
        const txs = txRes.ok ? await txRes.json() : [];

        const ghsBalance = balances.find((b: any) => b.currency === 'GHS')?.amount || 0;
        const nextUser: User = {
          id: String(userData.id),
          email: userData.email,
          investorId: userData.investor_id,
          tokenBalance: Number(ghsBalance) || 0,
          fullName: userData.full_name || '',
          passportData: userData.passport_file_path || '',
          telegram: userData.telegram_id || '',
          cryptoWallet: userData.crypto_wallet || ''
        };

        const nextContract = contracts[0]
          ? {
              number: userData.investor_id || '0000',
              amount: Number(contracts[0].amount_invested) || 0,
              startDate: formatDate(contracts[0].start_date),
              endDate: formatDate(contracts[0].end_date)
            }
          : buildFallbackContract(userData?.investor_id || undefined);

        const nextTransactions: Transaction[] = txs.map((tx: any) => ({
          id: String(tx.id),
          date: formatDate(tx.created_at),
          type: mapTransactionType(tx.type),
          amount: Number(tx.amount) || 0,
          status: tx.status || 'pending'
        }));

        setUser(nextUser);
        setContract(nextContract);
        setTransactions(nextTransactions);
        setAuthStatus(AuthStatus.AUTHENTICATED);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        // При ошибке API всегда требуем повторный вход
        localStorage.removeItem('ipg_token');
        localStorage.removeItem('ipg_refresh_token');
        localStorage.removeItem('ipg_user_id');
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        if ((window as any).__IPG_HOST) {
          setRequiresLogin(true);
          return;
        }
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/login.html';
        }
      }
  }, [apiBase, userId, buildFallbackContract]);

  useEffect(() => {
    fetchUserData();
    const interval = window.setInterval(fetchUserData, 30000);
    const handleFocus = () => fetchUserData();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUserData]);

  const loginUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    return isLocal ? 'http://localhost:5174/login.html' : 'https://ipg-invest.ae/login';
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ipg_token');
    localStorage.removeItem('ipg_refresh_token');
    localStorage.removeItem('ipg_user_id');
    setAuthStatus(AuthStatus.UNAUTHENTICATED);
    setUser(null);
    setContract(null);
    if ((window as any).__IPG_HOST) {
      setRequiresLogin(true);
      return;
    }
    window.location.href = '/login.html';
  }, []);

  if (requiresLogin) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#141417] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight text-white">Требуется вход</h2>
          <p className="text-white/40 text-xs md:text-sm mb-8 leading-relaxed font-medium">
            Для доступа в личный кабинет выполните вход.
          </p>
          <a
            href={loginUrl()}
            className="block w-full gold-gradient text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all"
          >
            Перейти к логину
          </a>
        </div>
      </div>
    );
  }

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const base = apiBase || (window as any).__IPG_API_BASE || 'http://localhost:3001';
    const payload: Record<string, string> = {};
    if (updatedData.email !== undefined) payload.email = updatedData.email;
    if (updatedData.fullName !== undefined) payload.full_name = updatedData.fullName;
    if (updatedData.passportData !== undefined) payload.passport_file_path = updatedData.passportData;
    if (updatedData.telegram !== undefined) payload.telegram_id = updatedData.telegram;
    if (updatedData.cryptoWallet !== undefined) payload.crypto_wallet = updatedData.cryptoWallet;

    if (Object.keys(payload).length) {
      await fetch(`${base}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const nextUser = { ...user, ...updatedData };
    setUser(nextUser);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!user) return;
    const base = apiBase || (window as any).__IPG_API_BASE || 'http://localhost:3001';
    const res = await fetch(`${base}/users/${user.id}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Password update failed');
    }
  };

  if (authStatus === AuthStatus.LOADING) {
    return (
      <div className="fixed inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center p-6 text-center z-[500]">
        <div className="relative mb-12 animate-pulse transition-all duration-1000">
          <svg width="100" height="115" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 md:w-28 md:h-28 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BF953F" />
                <stop offset="25%" stopColor="#FCF6BA" />
                <stop offset="50%" stopColor="#B38728" />
                <stop offset="75%" stopColor="#FBF5B7" />
                <stop offset="100%" stopColor="#AA771C" />
              </linearGradient>
            </defs>
            <path 
              d="M50 0L93.3013 25V75L50 100L6.69873 75V25L50 0Z" 
              fill="url(#goldGradient)" 
              fillOpacity="0.1"
              stroke="url(#goldGradient)" 
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d="M50 15V45" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"/>
            <path d="M50 55V85" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"/>
            <path d="M25 30L45 42" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"/>
            <path d="M75 30L55 42" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"/>
            <path d="M25 70L45 58" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"/>
            <path d="M75 70L55 58" stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/20 animate-in fade-in duration-1000">
            {t.securityProtocol}
          </p>
          <div className="flex flex-col items-center">
            <p className="text-xl md:text-3xl font-['Playfair_Display'] font-black gold-text uppercase tracking-[0.2em] leading-tight">
              Imperial
            </p>
            <p className="text-lg md:text-2xl font-['Playfair_Display'] font-black text-white/90 uppercase tracking-[0.15em] leading-tight">
              Pure Gold
            </p>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full pointer-events-none scale-0 animate-[ping_3s_linear_infinite]"></div>
      </div>
    );
  }

  if (authStatus === AuthStatus.UNAUTHENTICATED) {
    return (
      <div className="fixed inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center p-6 text-center z-[200]">
        <div className="max-w-md w-full bg-[#141417] p-10 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="mb-10">
             <span className="text-2xl md:text-3xl font-black tracking-tighter leading-none font-['Playfair_Display'] text-white">
                IMPERIAL <span className="gold-text">PURE GOLD</span>
              </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-4 tracking-tight text-white">{lang === 'ru' ? 'Сессия истекла' : 'Session Expired'}</h2>
          <p className="text-white/40 text-xs md:text-sm mb-10 leading-relaxed font-medium">
            {lang === 'ru' 
              ? 'Ваша сессия закончилась из соображений безопасности. Пожалуйста, войдите снова для доступа в личный кабинет.' 
              : 'Your secure investment session has ended for security reasons. Please sign in again to access your personal dashboard.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full gold-gradient text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all"
          >
            {lang === 'ru' ? 'Вернуться к порталу' : 'Reconnect to Secure Portal'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-[120px] bg-[#f5f5f7] selection:bg-amber-100">
      <Header 
        isLoggedIn={true} 
        onLogout={handleLogout} 
        lang={lang} 
        setLang={setLang}
        onNavigate={(v) => setActiveTab(v as ActiveTab)}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Navigation Tabs - Hidden for specific landing-like pages if desired, but kept for core dashboard navigation */}
        {(activeTab === 'dashboard' || activeTab === 'history' || activeTab === 'profile') && (
          <div className="flex space-x-6 md:space-x-10 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 text-[10px] md:text-xs font-black tracking-[0.15em] uppercase whitespace-nowrap transition-all relative ${activeTab === 'dashboard' ? 'text-[#aa8a2e]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.dashboard}
              {activeTab === 'dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d4af37] rounded-t-full shadow-lg"></div>
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-4 text-[10px] md:text-xs font-black tracking-[0.15em] uppercase whitespace-nowrap transition-all relative ${activeTab === 'history' ? 'text-[#aa8a2e]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.history}
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d4af37] rounded-t-full shadow-lg"></div>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`pb-4 text-[10px] md:text-xs font-black tracking-[0.15em] uppercase whitespace-nowrap transition-all relative ${activeTab === 'profile' ? 'text-[#aa8a2e]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.profile}
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d4af37] rounded-t-full shadow-lg"></div>
              )}
            </button>
          </div>
        )}

        <div className="content-area">
          {activeTab === 'dashboard' && user && contract && (
            <Dashboard user={user} contract={contract} lang={lang} />
          )}

          {activeTab === 'history' && (
            <TransactionHistory transactions={transactions} lang={lang} />
          )}

          {activeTab === 'profile' && user && (
            <Profile user={user} onUpdate={handleUpdateUser} onPasswordChange={handlePasswordChange} lang={lang} />
          )}

          {activeTab === 'calculator' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                <i className="fa-solid fa-calculator text-black text-3xl"></i>
              </div>
              <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-gray-900 mb-6 uppercase tracking-tight">
                {t.calculator}
              </h2>
              <p className="max-w-xl text-gray-500 font-medium leading-relaxed mb-10">
                {lang === 'ru' 
                  ? 'Рассчитайте потенциальную доходность ваших инвестиций на основе сложных процентов и текущих циклов 2026 года.' 
                  : 'Calculate the potential return on your investments based on compound interest and current 2026 cycles.'}
              </p>
              <div className="w-full max-w-md bg-gray-50 p-8 rounded-[2rem] border border-gray-100 italic text-gray-400">
                Interactive forecasting tool interface pending deployment...
              </div>
            </div>
          )}

          {activeTab === 'project' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col items-center text-center">
              <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                <i className="fa-solid fa-circle-info text-black text-3xl"></i>
              </div>
              <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-gray-900 mb-6 uppercase tracking-tight">
                {t.projectInfo}
              </h2>
              <p className="max-w-xl text-gray-500 font-medium leading-relaxed mb-10">
                {lang === 'ru'
                  ? 'Imperial Pure Gold — это эксклюзивная платформа для инвестиций в физическое золото, сочетающая традиции и современные финансовые технологии.'
                  : 'Imperial Pure Gold is an exclusive platform for investment in physical gold, combining tradition with modern financial technologies.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-amber-700 mb-2">Our Vision</h4>
                  <p className="text-sm text-gray-600">Democratizing institutional-grade gold investment vehicles for the modern elite.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-amber-700 mb-2">Security</h4>
                  <p className="text-sm text-gray-600">LBMA certified bullion storage in UAE world-class vault facilities.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  );
};

export default App;
