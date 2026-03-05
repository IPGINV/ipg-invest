
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TransactionHistory from './components/TransactionHistory';
import KycFlow from './components/KycFlow';
import ContactBinding from './components/ContactBinding';
import { User, Contract, AuthStatus, Transaction } from './types';
import { locales } from './locales';

type ActiveTab = 'dashboard' | 'history' | 'profile' | 'calculator' | 'project' | 'kyc' | 'contact_binding';

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
  const [kycLoading, setKycLoading] = useState(false);
  const [contactHint, setContactHint] = useState('');
  const [pendingFunding, setPendingFunding] = useState<{ source: 'deposit' | 'activate'; amount?: number } | null>(null);
  const [fundingError, setFundingError] = useState('');
  const [fundingBusy, setFundingBusy] = useState(false);
  const isRedirectingRef = useRef(false); // Используем ref вместо state
  const fetchUserDataRef = useRef<(() => Promise<void>) | null>(null); // Ref для функции
  const hasLoadedDataRef = useRef(false);
  const isFetchingRef = useRef(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const t = locales[lang];
  const envApiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const isLocalLikeHost = useCallback(() => {
    const host = window.location.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    );
  }, []);
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

  const refreshAccessToken = useCallback(async (base: string): Promise<string | null> => {
    const refreshToken = localStorage.getItem('ipg_refresh_token');
    if (!refreshToken) return null;
    try {
      const response = await fetch(`${base}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const nextAccessToken = payload?.accessToken;
      if (!nextAccessToken) return null;
      localStorage.setItem('ipg_token', nextAccessToken);
      if (payload?.refreshToken) {
        localStorage.setItem('ipg_refresh_token', payload.refreshToken);
      }
      if (payload?.user?.id) {
        localStorage.setItem('ipg_user_id', String(payload.user.id));
      }
      return nextAccessToken;
    } catch {
      return null;
    }
  }, []);

  const fetchUserData = useCallback(async () => {
      const base = apiBase || (window as any).__IPG_API_BASE ||
        (isLocalLikeHost() ? 'http://localhost:3005' : (envApiBase || 'https://api.ipg-invest.ae'));
      const isHost = Boolean((window as any).__IPG_HOST);
      const token = localStorage.getItem('ipg_token');
      const storedUserId = localStorage.getItem('ipg_user_id');
      const resolvedUserId = userId || storedUserId || '';

      if (isFetchingRef.current) {
        return;
      }
      isFetchingRef.current = true;

      // Всегда требуем реальный токен и userId для доступа к Dashboard
      if (!token || !resolvedUserId) {
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        if (isHost) {
          setRequiresLogin(true);
          isFetchingRef.current = false;
          return;
        }
        // Редиректим только если не на странице логина и еще не редиректим
        const currentPath = window.location.pathname;
        if (currentPath !== '/login.html' && !currentPath.includes('/login') && !isRedirectingRef.current) {
          isRedirectingRef.current = true;
          window.location.href = '/login.html';
        }
        isFetchingRef.current = false;
        return;
      }
      if (!hasLoadedDataRef.current) {
        setAuthStatus(AuthStatus.LOADING);
      }
      try {
        let effectiveToken = token;
        let authHeaders = { Authorization: `Bearer ${effectiveToken}` };
        let userRes = await fetch(`${base}/users/${resolvedUserId}`, { headers: authHeaders });

        if (userRes.status === 401 || userRes.status === 403) {
          const refreshedToken = await refreshAccessToken(base);
          if (refreshedToken) {
            effectiveToken = refreshedToken;
            authHeaders = { Authorization: `Bearer ${effectiveToken}` };
            userRes = await fetch(`${base}/users/${resolvedUserId}`, { headers: authHeaders });
          }
        }

        if (userRes.status === 401 || userRes.status === 403) {
          localStorage.removeItem('ipg_token');
          localStorage.removeItem('ipg_refresh_token');
          localStorage.removeItem('ipg_user_id');
          setAuthStatus(AuthStatus.UNAUTHENTICATED);
          if (!(window as any).__IPG_HOST && window.location.pathname !== '/login.html' && !isRedirectingRef.current) {
            isRedirectingRef.current = true;
            window.location.href = '/login.html';
          } else if ((window as any).__IPG_HOST) {
            setRequiresLogin(true);
          }
          isFetchingRef.current = false;
          return;
        }
        if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);

        const [balancesResult, contractsResult, txResult] = await Promise.allSettled([
          fetch(`${base}/balances?userId=${resolvedUserId}`, { headers: authHeaders }),
          fetch(`${base}/contracts?userId=${resolvedUserId}`, { headers: authHeaders }),
          fetch(`${base}/transactions?userId=${resolvedUserId}&limit=50`, { headers: authHeaders })
        ]);

        const userData = await userRes.json();
        const balancesRes = balancesResult.status === 'fulfilled' ? balancesResult.value : null;
        const contractsRes = contractsResult.status === 'fulfilled' ? contractsResult.value : null;
        const txRes = txResult.status === 'fulfilled' ? txResult.value : null;

        const balancesData = balancesRes && balancesRes.ok ? await balancesRes.json().catch(() => []) : [];
        const contractsData = contractsRes && contractsRes.ok ? await contractsRes.json().catch(() => []) : [];
        const txsData = txRes && txRes.ok ? await txRes.json().catch(() => []) : [];

        const balances = Array.isArray(balancesData) ? balancesData : [];
        const contracts = Array.isArray(contractsData) ? contractsData : [];
        const txs = Array.isArray(txsData) ? txsData : [];

        const ghsBalance = balances.find((b: any) => b.currency === 'GHS')?.amount || 0;
        const nextUser: User = {
          id: String(userData.id),
          email: userData.email,
          investorId: userData.investor_id,
          tokenBalance: Number(ghsBalance) || 0,
          fullName: userData.full_name || '',
          passportData: userData.passport_file_path || '',
          telegram: userData.telegram_id || '',
          cryptoWallet: userData.crypto_wallet || '',
          status: userData.status,
          emailVerified: Boolean(userData.email_verified),
          onboardingStep: userData.onboarding_step || 'registered',
          pendingExpiresAt: userData.pending_expires_at || null,
          phone: userData.phone || ''
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
        hasLoadedDataRef.current = true;
        setAuthStatus(AuthStatus.AUTHENTICATED);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        const message = err instanceof Error ? err.message : String(err || '');
        if (message.includes('429')) {
          if (retryTimeoutRef.current === null) {
            retryTimeoutRef.current = window.setTimeout(() => {
              retryTimeoutRef.current = null;
              fetchUserDataRef.current?.();
            }, 5000);
          }
        }
        // Не оставляем экран в вечном LOADING при первичном сбое API.
        // Если не удалось загрузить данные ни разу, отправляем на логин.
        if (!hasLoadedDataRef.current) {
          setAuthStatus(AuthStatus.UNAUTHENTICATED);
          if ((window as any).__IPG_HOST) {
            setRequiresLogin(true);
          } else if (window.location.pathname !== '/login.html' && !isRedirectingRef.current) {
            isRedirectingRef.current = true;
            window.location.href = '/login.html';
          }
        } else {
          setAuthStatus(AuthStatus.AUTHENTICATED);
        }
      }
      isFetchingRef.current = false;
  }, [apiBase, envApiBase, userId, isLocalLikeHost, refreshAccessToken]);

  // Сохраняем функцию в ref для использования в useEffect
  fetchUserDataRef.current = fetchUserData;

  useEffect(() => {
    console.log('[Dashboard] useEffect mounted - checking auth');
    // Запускаем только если есть токен
    const token = localStorage.getItem('ipg_token');
    if (!token) {
      console.log('[Dashboard] No token found, setting UNAUTHENTICATED');
      setAuthStatus(AuthStatus.UNAUTHENTICATED);
      return;
    }
    
    console.log('[Dashboard] Token found, fetching user data');
    // Вызываем через ref
    fetchUserDataRef.current?.();
    
    // Обновляем данные каждые 30 секунд только если пользователь авторизован
    const interval = window.setInterval(() => {
      const currentToken = localStorage.getItem('ipg_token');
      if (currentToken) {
        console.log('[Dashboard] Interval: refreshing data');
        fetchUserDataRef.current?.();
      }
    }, 30000);
    
    const handleFocus = () => {
      const currentToken = localStorage.getItem('ipg_token');
      if (currentToken) {
        console.log('[Dashboard] Focus: refreshing data');
        fetchUserDataRef.current?.();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      console.log('[Dashboard] useEffect cleanup');
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []); // Пустые зависимости - запускаем только один раз!

  const loginUrl = () => {
    return isLocalLikeHost() ? 'http://localhost:3000/login.html' : 'https://dashboard.ipg-invest.ae/login.html';
  };

  useEffect(() => {
    if (!requiresLogin) return;
    window.location.href = loginUrl();
  }, [requiresLogin]);

  useEffect(() => {
    if (authStatus !== AuthStatus.UNAUTHENTICATED) return;
    if (requiresLogin) return;
    if (window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
  }, [authStatus, requiresLogin]);

  useEffect(() => {
    if (authStatus !== AuthStatus.AUTHENTICATED) return;
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('flow');
    const pendingStart = localStorage.getItem('ipg_start_kyc');
    if (flow === 'kyc' || pendingStart === '1') {
      setActiveTab('kyc');
      localStorage.removeItem('ipg_start_kyc');
      if (flow === 'kyc') {
        params.delete('flow');
        const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
      }
    }
  }, [authStatus]);

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
    return null;
  }

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const base = apiBase || (window as any).__IPG_API_BASE || (isLocalLikeHost() ? 'http://localhost:3005' : (envApiBase || 'https://api.ipg-invest.ae'));
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
    const base = apiBase || (window as any).__IPG_API_BASE || (isLocalLikeHost() ? 'http://localhost:3005' : (envApiBase || 'https://api.ipg-invest.ae'));
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

  const resolveBase = () =>
    apiBase || (window as any).__IPG_API_BASE || (isLocalLikeHost() ? 'http://localhost:3005' : (envApiBase || 'https://api.ipg-invest.ae'));

  const authHeaders = () => {
    const token = localStorage.getItem('ipg_token') || '';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const postWithAuthRetry = useCallback(async (url: string, body: Record<string, any>) => {
    let token = localStorage.getItem('ipg_token') || '';
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (response.status === 401 || response.status === 403) {
      const refreshed = await refreshAccessToken(resolveBase());
      if (refreshed) {
        token = refreshed;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      }
    }
    return response;
  }, [refreshAccessToken, resolveBase]);

  const openPaymentIntent = async (source: 'deposit' | 'activate', amount?: number) => {
    const base = resolveBase();
    const parsedAmount = Number(amount);
    const targetAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 100;
    const res = await postWithAuthRetry(`${base}/payments/intents`, {
      amount: targetAmount,
      settlementCurrency: 'USD',
      asset: 'USDT',
      network: 'TRC20',
      source
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Failed to create payment intent');
    }
    if (body?.payment_url) {
      window.open(body.payment_url, '_blank');
    }
    fetchUserDataRef.current?.();
  };

  const handleStartFunding = async (source: 'deposit' | 'activate', amount?: number) => {
    if (fundingBusy) return;
    setFundingBusy(true);
    setFundingError('');
    try {
      const base = resolveBase();
      const pre = await postWithAuthRetry(`${base}/payments/precheck`, {});
      const preBody = await pre.json().catch(() => ({}));
      if (!pre.ok) throw new Error(preBody.error || 'Precheck failed');
      setPendingFunding({ source, amount });
      if (preBody.nextStep === 'gateway_direct') {
        await openPaymentIntent(source, amount);
        return;
      }
      if (preBody.nextStep === 'contact_binding_required') {
        setActiveTab('contact_binding');
        return;
      }
      setActiveTab('kyc');
    } catch (error) {
      console.error('[Funding flow error]', error);
      const message = error instanceof Error ? error.message : 'Funding flow failed';
      setFundingError(message);
      if (message.toLowerCase().includes('unauthorized')) {
        setRequiresLogin(true);
      }
    } finally {
      setFundingBusy(false);
    }
  };

  const completeKyc = async (payload: { surname: string; name: string; email: string; phone: string; documentFileName: string }) => {
    if (!user) return;
    setKycLoading(true);
    try {
      const base = resolveBase();
      await fetch(`${base}/users/${user.id}/kyc`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          surname: payload.surname,
          name: payload.name,
          email: payload.email,
          phone: payload.phone
        })
      });
      if (payload.documentFileName) {
        await fetch(`${base}/users/${user.id}/documents`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ file_url: payload.documentFileName, doc_type: 'passport' })
        });
      }
      await fetchUserDataRef.current?.();
      const funding = pendingFunding || { source: 'deposit' as const, amount: 100 };
      await openPaymentIntent(funding.source, funding.amount);
      setPendingFunding(null);
      setActiveTab('dashboard');
    } finally {
      setKycLoading(false);
    }
  };

  const resendEmailVerification = async () => {
    const base = resolveBase();
    const res = await fetch(`${base}/auth/verify-email/resend`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({})
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Email resend failed');
    setContactHint(lang === 'ru' ? 'Письмо отправлено. Перейдите по ссылке из почты.' : 'Verification email sent.');
  };

  const openTelegramBinding = () => {
    window.open('https://t.me/GoldenShareClub', '_blank');
    setContactHint(lang === 'ru' ? 'Откройте бота и завершите привязку.' : 'Open Telegram bot and finish binding.');
  };

  const continueAfterBinding = async () => {
    const base = resolveBase();
    const res = await fetch(`${base}/auth/onboarding-status`, {
      method: 'GET',
      headers: authHeaders()
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Onboarding status failed');
    const verified = Boolean(body?.email?.status === 'verified' || body?.telegram?.status === 'verified' || body?.email_verified);
    if (!verified) {
      setContactHint(lang === 'ru' ? 'Сначала завершите привязку Email или Telegram.' : 'Please complete Email or Telegram binding first.');
      return;
    }
    const funding = pendingFunding || { source: 'deposit' as const, amount: 100 };
    await openPaymentIntent(funding.source, funding.amount);
    setPendingFunding(null);
    setActiveTab('dashboard');
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
    return null;
  }

  const isPendingUser = user?.status === 'pending';

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
        {(activeTab === 'dashboard' || activeTab === 'history' || activeTab === 'profile' || activeTab === 'kyc' || activeTab === 'contact_binding') && (
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
          {fundingError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
              <p className="text-xs font-black uppercase tracking-wider mb-1">
                {lang === 'ru' ? 'Ошибка пополнения' : 'Funding Error'}
              </p>
              <p className="text-sm">{fundingError}</p>
            </div>
          )}
          {isPendingUser && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
              <p className="text-xs font-black uppercase tracking-wider mb-1">Onboarding Required</p>
              <p className="text-sm">
                Завершите подтверждение email/telegram и загрузите документы. Финансовые операции для pending-аккаунта временно недоступны.
              </p>
            </div>
          )}
          {activeTab === 'dashboard' && user && contract && (
            <Dashboard
              user={user}
              contract={contract}
              lang={lang}
              isPending={isPendingUser}
              onRequestVerification={() => setActiveTab('kyc')}
              onStartFunding={(source, amount) => {
                void handleStartFunding(source, amount);
              }}
            />
          )}

          {activeTab === 'history' && (
            <TransactionHistory transactions={transactions} lang={lang} />
          )}

          {activeTab === 'profile' && user && (
            <Profile user={user} onUpdate={handleUpdateUser} onPasswordChange={handlePasswordChange} lang={lang} />
          )}

          {activeTab === 'kyc' && user && (
            <KycFlow
              user={user}
              lang={lang}
              loading={kycLoading}
              onSubmit={async (payload) => {
                await completeKyc(payload);
              }}
              onSkip={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'contact_binding' && (
            <ContactBinding
              lang={lang}
              hint={contactHint}
              onEmail={resendEmailVerification}
              onTelegram={openTelegramBinding}
              onContinue={continueAfterBinding}
            />
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
