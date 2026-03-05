import React, { useState, useEffect, useCallback, useRef } from 'react';
import HeaderV2 from './components/HeaderV2';
import FooterV2 from './components/FooterV2';
import { HeaderVisibilityProvider } from './context/HeaderVisibilityContext';
import { DashboardPage } from './pages/Dashboard';
import { History } from './pages/History';
import { ProfilePage } from './pages/Profile';
import { KYCPage } from './pages/KYCPage';
import { PaymentPage } from './pages/PaymentPage';
import ContactBinding from './components/ContactBinding';
import { CalculatorPage } from './pages/CalculatorPage';
import LoadingScreenV2 from './components/LoadingScreenV2';
import { User, Contract, AuthStatus, Transaction } from './types';
import { locales } from './locales';

type ActiveTab = 'dashboard' | 'history' | 'profile' | 'calculator' | 'kyc' | 'contact_binding';

type AppV2Props = {
  apiBase?: string;
  userId?: string;
};

const toUserFriendlyError = (msg: string, lang: 'en' | 'ru'): string => {
  const m = msg.toLowerCase();
  if (m.includes('unauthorized') || m.includes('token')) return lang === 'ru' ? 'Ð¡ÐµÑÑÐ¸Ñ Ð¸ÑÑ‚ÐµÐºÐ»Ð°. Ð’Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°.' : 'Session expired. Please log in again.';
  if (m.includes('port') || m.includes('server') || m.includes('api') || m.includes('404') || m.includes('502') || m.includes('503')) return lang === 'ru' ? 'Ð¡ÐµÑ€Ð²Ð¸Ñ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ð¾ Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ð¿Ð¾Ð·Ð¶Ðµ.' : 'Service temporarily unavailable. Please try again later.';
  if (m.includes('precheck') || m.includes('funding flow')) return lang === 'ru' ? 'ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð²Ñ‹Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÑŒ Ð¾Ð¿ÐµÑ€Ð°Ñ†Ð¸ÑŽ. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ð¿Ð¾Ð·Ð¶Ðµ.' : 'Operation failed. Please try again later.';
  return msg;
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

const AppV2: React.FC<AppV2Props> = ({ apiBase, userId }) => {
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
  const [kycPageError, setKycPageError] = useState('');
  const [loadingMinElapsed, setLoadingMinElapsed] = useState(false);
  const [authLoadTimeout, setAuthLoadTimeout] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [serverYield, setServerYield] = useState<{ balance: number; profit: number; cyclesApplied: number; cyclesLeft: number; nextCycle?: { id: number; date: Date; yield_rate: number } } | null>(null);
  const [apiCycles, setApiCycles] = useState<{ id: number; cycle_number: number; cycle_date: string; yield_rate: number }[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const isRedirectingRef = useRef(false);
  const fetchUserDataRef = useRef<(() => Promise<void>) | null>(null);
  const hasLoadedDataRef = useRef(false);
  const isFetchingRef = useRef(false);
  const retryTimeoutRef = useRef<number | null>(null);

  const t = locales[lang];
  const envApiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const isDev = (import.meta as any).env?.DEV;

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
    const refreshToken = sessionStorage.getItem('ipg_refresh_token');
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
      sessionStorage.setItem('ipg_token', nextAccessToken);
      if (payload?.refreshToken) {
        sessionStorage.setItem('ipg_refresh_token', payload.refreshToken);
      }
      if (payload?.user?.id) {
        sessionStorage.setItem('ipg_user_id', String(payload.user.id));
      }
      return nextAccessToken;
    } catch {
      return null;
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    const base = resolveBase();
    const isHost = Boolean((window as any).__IPG_HOST);
    const token = sessionStorage.getItem('ipg_token');
    const storedUserId = sessionStorage.getItem('ipg_user_id');
    const resolvedUserId = userId || storedUserId || '';

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!token || !resolvedUserId) {
      setAuthStatus(AuthStatus.UNAUTHENTICATED);
      if (isHost) {
        setRequiresLogin(true);
        isFetchingRef.current = false;
        return;
      }
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
        sessionStorage.removeItem('ipg_token');
        sessionStorage.removeItem('ipg_refresh_token');
        sessionStorage.removeItem('ipg_user_id');
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
      const ghsBalance = balances.find((b: any) => b.currency === 'GHS')?.amount || 0;

      const nextUser: User = {
        id: String(userData.id),
        email: userData.email,
        investorId: userData.investor_display_id ?? null,
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

      const contracts = Array.isArray(contractsData) ? contractsData : [];
      const displayId = userData.investor_display_id ?? userData.investor_id;
      const nextContract = contracts[0]
        ? {
            number: displayId || '0000',
            amount: Number(contracts[0].amount_invested) || 0,
            startDate: formatDate(contracts[0].start_date),
            endDate: formatDate(contracts[0].end_date)
          }
        : buildFallbackContract(displayId || undefined);

      const txs = Array.isArray(txsData) ? txsData : [];
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

      // Fetch yield (server-calculated) and cycles in parallel
      const [yieldRes, cyclesRes] = await Promise.allSettled([
        fetch(`${base}/unified/yield`, { headers: authHeaders }),
        fetch(`${base}/cycles`)
      ]);
      const yieldData = yieldRes.status === 'fulfilled' && yieldRes.value.ok ? await yieldRes.value.json() : null;
      const cyclesData = cyclesRes.status === 'fulfilled' && cyclesRes.value.ok ? await cyclesRes.value.json() : [];
      if (yieldData) {
        setServerYield({
          balance: yieldData.balance ?? 0,
          profit: yieldData.profit ?? 0,
          cyclesApplied: yieldData.cyclesApplied ?? 0,
          cyclesLeft: yieldData.cyclesLeft ?? 0,
          nextCycle: yieldData.nextCycle ? { ...yieldData.nextCycle, date: new Date(yieldData.nextCycle.date) } : undefined
        });
      } else {
        setServerYield(null);
      }
      setApiCycles(Array.isArray(cyclesData) ? cyclesData : []);
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
  }, [apiBase, envApiBase, userId, isLocalLikeHost, refreshAccessToken, buildFallbackContract]);

  fetchUserDataRef.current = fetchUserData;

  useEffect(() => {
    const hash = window.location.hash;
    const authMatch = hash.match(/^#auth=(.+)$/);
    if (authMatch && authMatch[1]) {
      try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(authMatch[1]))));
        if (payload.t) {
          sessionStorage.setItem('ipg_token', payload.t);
          sessionStorage.setItem('ipg_refresh_token', payload.r || '');
          sessionStorage.setItem('ipg_user_id', String(payload.u || ''));
          sessionStorage.setItem('ipg_user_status', payload.s || 'active');
          sessionStorage.setItem('ipg_onboarding_step', payload.o || 'registered');
          window.history.replaceState({}, '', window.location.pathname + window.location.search);
        }
      } catch {
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoadingMinElapsed(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (authStatus !== AuthStatus.LOADING) {
      setAuthLoadTimeout(false);
      return;
    }
    const t = setTimeout(() => setAuthLoadTimeout(true), 20000);
    return () => clearTimeout(t);
  }, [authStatus]);

  useEffect(() => {
    const token = sessionStorage.getItem('ipg_token');
    if (!token) {
      setAuthStatus(AuthStatus.UNAUTHENTICATED);
      return;
    }
    fetchUserDataRef.current?.();

    const interval = window.setInterval(() => {
      const currentToken = sessionStorage.getItem('ipg_token');
      if (currentToken) {
        fetchUserDataRef.current?.();
      }
    }, 30000);

    const handleFocus = () => {
      const currentToken = sessionStorage.getItem('ipg_token');
      if (currentToken) {
        fetchUserDataRef.current?.();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (authStatus === AuthStatus.AUTHENTICATED) {
      const params = new URLSearchParams(window.location.search);
      const flow = params.get('flow');
      const pendingStart = sessionStorage.getItem('ipg_start_kyc');
      if (flow === 'kyc' || pendingStart === '1') {
        setActiveTab('kyc');
        sessionStorage.removeItem('ipg_start_kyc');
        if (flow === 'kyc') {
          params.delete('flow');
          const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
          window.history.replaceState({}, '', nextUrl);
        }
      }
    }
  }, [authStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('calculator') === 'true') {
      setActiveTab('calculator');
      params.delete('calculator');
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

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

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('ipg_token');
    sessionStorage.removeItem('ipg_refresh_token');
    sessionStorage.removeItem('ipg_user_id');
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
    const base =
      apiBase ||
      (window as any).__IPG_API_BASE ||
      (isLocalLikeHost() ? 'http://localhost:3005' : (envApiBase || 'https://api.ipg-invest.ae'));
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
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!user) return;
    const base =
      apiBase ||
      (window as any).__IPG_API_BASE ||
      (isLocalLikeHost() ? 'http://localhost:3005' : (envApiBase || 'https://api.ipg-invest.ae'));
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

  const resolveBase = () => {
    const overrides = apiBase || (window as any).__IPG_API_BASE;
    if (overrides) return overrides;
    if (isLocalLikeHost() && isDev) return window.location.origin;
    if (isLocalLikeHost()) return 'http://localhost:3005';
    return envApiBase || 'https://api.ipg-invest.ae';
  };

  const authHeaders = () => {
    const token = sessionStorage.getItem('ipg_token') || '';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const postWithAuthRetry = useCallback(
    async (url: string, body: Record<string, any>) => {
      let token = sessionStorage.getItem('ipg_token') || '';
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
    },
    [refreshAccessToken]
  );

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
      const raw = error instanceof Error ? error.message : 'Funding flow failed';
      const message = toUserFriendlyError(raw, lang);
      setFundingError(message);
      if (raw.toLowerCase().includes('unauthorized')) {
        setRequiresLogin(true);
      }
    } finally {
      setFundingBusy(false);
    }
  };

  const completeKycFormOnly = async (payload: {
    surname: string;
    name: string;
    email: string;
    phone: string;
    documentFileName: string;
  }) => {
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
    } finally {
      setKycLoading(false);
    }
  };

  const onKycBindingComplete = async () => {
    const base = resolveBase();
    const res = await fetch(`${base}/auth/onboarding-status`, {
      method: 'GET',
      headers: authHeaders()
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Onboarding status failed');
    const verified = Boolean(
      body?.email?.status === 'verified' || body?.telegram?.status === 'verified' || body?.email_verified
    );
    if (!verified) {
      setContactHint(
        lang === 'ru'
          ? 'Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° Ð·Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð¿Ñ€Ð¸Ð²ÑÐ·ÐºÑƒ Email Ð¸Ð»Ð¸ Telegram.'
          : 'Please complete Email or Telegram binding first.'
      );
      return;
    }
    const funding = pendingFunding || { source: 'deposit' as const, amount: 100 };
    await openPaymentIntent(funding.source, funding.amount);
    setPendingFunding(null);
    setActiveTab('dashboard');
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
    setContactHint(
      lang === 'ru' ? 'ÐŸÐ¸ÑÑŒÐ¼Ð¾ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¾. ÐŸÐµÑ€ÐµÐ¹Ð´Ð¸Ñ‚Ðµ Ð¿Ð¾ ÑÑÑ‹Ð»ÐºÐµ Ð¸Ð· Ð¿Ð¾Ñ‡Ñ‚Ñ‹.' : 'Verification email sent.'
    );
  };

  const openTelegramBinding = async () => {
    const base = resolveBase();
    const res = await fetch(`${base}/auth/telegram/bind-link`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({})
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Telegram link request failed');

    if (body?.bot_link) {
      window.open(body.bot_link, '_blank');
    }

    setContactHint(
      lang === 'ru'
        ? 'Ссылка отправлена через бота. Следуйте инструкции в Telegram.'
        : 'Bot link sent. Please follow the instructions in Telegram.'
    );
  };

  const continueAfterBinding = async () => {
    const base = resolveBase();
    const res = await fetch(`${base}/auth/onboarding-status`, {
      method: 'GET',
      headers: authHeaders()
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Onboarding status failed');
    const verified = Boolean(
      body?.email?.status === 'verified' || body?.telegram?.status === 'verified' || body?.email_verified
    );
    if (!verified) {
      setContactHint(
        lang === 'ru'
          ? 'Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° Ð·Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð¿Ñ€Ð¸Ð²ÑÐ·ÐºÑƒ Email Ð¸Ð»Ð¸ Telegram.'
          : 'Please complete Email or Telegram binding first.'
      );
      return;
    }
    const funding = pendingFunding || { source: 'deposit' as const, amount: 100 };
    await openPaymentIntent(funding.source, funding.amount);
    setPendingFunding(null);
    setActiveTab('dashboard');
  };

  const handleKycPageComplete = async () => {
    setKycPageError('');
    const base = resolveBase();
    const res = await fetch(`${base}/auth/onboarding-status`, {
      method: 'GET',
      headers: authHeaders()
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setKycPageError(toUserFriendlyError(body.error || '', lang) || (lang === 'ru' ? 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ¸ ÑÑ‚Ð°Ñ‚ÑƒÑÐ°' : 'Status check failed'));
      return;
    }
    const verified = Boolean(
      body?.email?.status === 'verified' || body?.telegram?.status === 'verified' || body?.email_verified
    );
    if (!verified) {
      setKycPageError(
        lang === 'ru'
          ? 'Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° Ð·Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð¿Ñ€Ð¸Ð²ÑÐ·ÐºÑƒ Email Ð¸Ð»Ð¸ Telegram.'
          : 'Please complete Email or Telegram binding first.'
      );
      return;
    }
    await fetchUserDataRef.current?.();
    if (pendingFunding) {
      await openPaymentIntent(pendingFunding.source, pendingFunding.amount);
      setPendingFunding(null);
    }
    setActiveTab('dashboard');
  };

  if (authStatus === AuthStatus.UNAUTHENTICATED) {
    return null;
  }

  if (authLoadTimeout && authStatus === AuthStatus.LOADING) {
    return (
      <div className="fixed inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center z-[100] p-6">
        <h1 className="font-serif text-xl text-white tracking-wider mb-4">
          {lang === 'ru' ? 'Ð¡ÐµÑ€Ð²Ð¸Ñ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ð¾ Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿ÐµÐ½' : 'Service temporarily unavailable'}
        </h1>
        <p className="text-[#a0a0a0] text-sm text-center mb-6">
          {lang === 'ru'
            ? 'Ð—Ð°Ð³Ñ€ÑƒÐ·ÐºÐ° Ð·Ð°Ð½ÑÐ»Ð° ÑÐ»Ð¸ÑˆÐºÐ¾Ð¼ Ð¼Ð½Ð¾Ð³Ð¾ Ð²Ñ€ÐµÐ¼ÐµÐ½Ð¸. ÐŸÑ€Ð¾Ð²ÐµÑ€ÑŒÑ‚Ðµ Ð¿Ð¾Ð´ÐºÐ»ÑŽÑ‡ÐµÐ½Ð¸Ðµ Ð¸ Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°.'
            : 'Loading took too long. Check your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setAuthLoadTimeout(false);
            fetchUserDataRef.current?.();
          }}
          className="px-6 py-3 rounded-xl bg-[#d4af37] text-black font-bold hover:brightness-110 transition"
        >
          {lang === 'ru' ? 'ÐŸÐ¾Ð²Ñ‚Ð¾Ñ€Ð¸Ñ‚ÑŒ' : 'Retry'}
        </button>
      </div>
    );
  }

  const showLoadingScreen = authStatus === AuthStatus.LOADING || (authStatus === AuthStatus.AUTHENTICATED && !loadingMinElapsed);
  if (showLoadingScreen) {
    return <LoadingScreenV2 onComplete={() => setLoadingMinElapsed(true)} lang={lang} minDuration={800} />;
  }

  const isPendingUser = user?.status === 'pending';

  return (
    <HeaderVisibilityProvider externalOverlays={{ payment: showPaymentPage }}>
      <div className="min-h-screen flex flex-col pt-[156px] bg-[#f5f5f7] selection:bg-amber-100">
        <HeaderV2
          isLoggedIn={true}
          onLogout={handleLogout}
          lang={lang}
          setLang={setLang}
          currentPage={activeTab}
          onNavigate={(p) => setActiveTab(p as ActiveTab)}
          hideNavBar={showPaymentPage}
        />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="content-area">
          {fundingError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
              <p className="text-xs font-black uppercase tracking-wider mb-1">
                {lang === 'ru' ? 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ñ' : 'Funding Error'}
              </p>
              <p className="text-sm">{toUserFriendlyError(fundingError, lang)}</p>
            </div>
          )}
          {isPendingUser && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
              <p className="text-xs font-black uppercase tracking-wider mb-1">Onboarding Required</p>
              <p className="text-sm">
                {lang === 'ru'
                  ? 'Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ðµ email/telegram Ð¸ Ð·Ð°Ð³Ñ€ÑƒÐ·Ð¸Ñ‚Ðµ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñ‹.'
                  : 'Complete email/telegram verification and upload documents.'}
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && user && contract && (
            <DashboardPage
              user={user}
              contract={contract}
              lang={lang}
              isPending={isPendingUser}
              serverYield={serverYield}
              apiCycles={apiCycles}
              onTriggerKYC={() => setActiveTab('kyc')}
              onStartFunding={(source, amount) => void handleStartFunding(source, amount)}
              onOpenPayment={(amt) => {
                setPaymentAmount(amt);
                setShowPaymentPage(true);
              }}
            />
          )}

          {activeTab === 'history' && (
            <History transactions={transactions} lang={lang} />
          )}

          {activeTab === 'profile' && user && (
            <ProfilePage
              user={user}
              onUpdate={handleUpdateUser}
              onPasswordChange={handlePasswordChange}
              lang={lang}
              onTriggerKYC={() => setActiveTab('kyc')}
            />
          )}

          {activeTab === 'kyc' && user && (
            <KYCPage
              user={user}
              lang={lang}
              loading={kycLoading}
              verificationError={kycPageError}
              completeKyc={completeKycFormOnly}
              onComplete={handleKycPageComplete}
              onEmailResend={resendEmailVerification}
              onTelegramOpen={openTelegramBinding}
            />
          )}

          {activeTab === 'calculator' && (
            <CalculatorPage
              lang={lang}
              onInvest={() => setActiveTab('dashboard')}
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
        </div>
      </main>

        <FooterV2 lang={lang} />

        {showPaymentPage && (
        <PaymentPage
          amount={paymentAmount || 100}
          lang={lang}
          onClose={() => setShowPaymentPage(false)}
          onSubmit={async (txId) => {
            const base = resolveBase();
            const token = sessionStorage.getItem('ipg_token');
            if (!token) throw new Error('Unauthorized');
            const res = await fetch(`${base}/deposits/submit`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ amount: paymentAmount || 100, tx_hash: txId })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              const msg = toUserFriendlyError(data.error || '', lang);
              throw new Error(msg || (lang === 'ru' ? 'ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ Ð¾Ñ‚Ð¿Ñ€Ð°Ð²Ð¸Ñ‚ÑŒ Ð¿Ð¾Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ðµ. ÐŸÐ¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ Ð¿Ð¾Ð·Ð¶Ðµ.' : 'Failed to submit deposit. Please try again later.'));
            }
            setShowPaymentPage(false);
            fetchUserDataRef.current?.();
            alert(lang === 'ru' ? 'ÐžÐ¶Ð¸Ð´Ð°Ð¹Ñ‚Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Ð´ÐµÐ¿Ð¾Ð·Ð¸Ñ‚Ð°. ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€ Ð¿Ñ€Ð¾Ð²ÐµÑ€Ð¸Ñ‚ Ð¿Ð»Ð°Ñ‚Ñ‘Ð¶ Ð¸ Ð·Ð°Ñ‡Ð¸ÑÐ»Ð¸Ñ‚ ÑÑ€ÐµÐ´ÑÑ‚Ð²Ð°.' : 'Please wait for deposit confirmation. Administrator will verify the payment and credit your account.');
          }}
        />
        )}
      </div>
    </HeaderVisibilityProvider>
  );
};

export default AppV2;

