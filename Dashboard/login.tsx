import './index.css';
import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';

type LoginResult = {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: number;
    investor_id: string;
    email: string;
    full_name: string;
    status?: 'active' | 'pending' | 'blocked' | 'deleted';
    email_verified?: boolean;
    onboarding_step?: string;
  };
};

const LoginApp: React.FC = () => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlPrefill = params.get('login') || params.get('email') || '';
  const amountParam = params.get('amount') || '';

  const [login, setLogin] = useState(urlPrefill);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryDone, setRecoveryDone] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySocial, setRecoverySocial] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');

  const apiBase = useMemo(() => {
    const override = (window as any).__IPG_API_BASE;
    if (override) return override;
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    return isLocal ? '' : 'https://api.ipg-invest.ae';
  }, []);

  const nextFlow = useMemo(() => params.get('next'), [params]);

  const registrationUrl = useMemo(() => {
    const configuredBase = (import.meta as any).env?.VITE_LENDING_APP_URL as string | undefined;
    const fallbackBase = 'https://ipg-invest.ae';
    try {
      const url = new URL(configuredBase || fallbackBase);
      url.searchParams.set('step', 'REGISTRATION');
      return url.toString();
    } catch {
      return `${fallbackBase}/?step=REGISTRATION`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(new Error('Timeout')), 15000);
      const res = await fetch(`${apiBase || ''}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
        signal: ctrl.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Login failed');
      }

      const data: LoginResult = await res.json();
      sessionStorage.setItem('ipg_token', data.tokens.accessToken);
      sessionStorage.setItem('ipg_refresh_token', data.tokens.refreshToken);
      sessionStorage.setItem('ipg_user_id', String(data.user.id));
      sessionStorage.setItem('ipg_user_status', data.user.status || 'active');
      sessionStorage.setItem('ipg_email_verified', String(Boolean(data.user.email_verified)));
      sessionStorage.setItem('ipg_onboarding_step', data.user.onboarding_step || 'registered');

      setTimeout(() => {
        if (nextFlow === 'kyc') {
          window.location.href = '/?flow=kyc';
          return;
        }
        if (nextFlow === 'funding') {
          const target = new URL('/', window.location.origin);
          target.searchParams.set('flow', 'funding');
          if (amountParam) {
            target.searchParams.set('amount', amountParam);
          }
          window.location.href = target.toString();
          return;
        }
        if (nextFlow === 'profile') {
          sessionStorage.setItem('ipg_post_login_tab', 'profile');
        }
        window.location.href = '/';
      }, 150);
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError' || err?.message?.includes('abort') || err?.message?.includes('Timeout');
      const isNetwork = !err?.message || err.message.includes('fetch') || err.message.includes('Failed to fetch');
      setError(isAbort ? 'Превышено время ожидания. Попробуйте снова.' : (isNetwork ? 'Ошибка сети. Проверьте подключение.' : (err.message || 'Ошибка входа')));
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryDone('');
    setRecoveryLoading(true);
    try {
      const res = await fetch(`${apiBase || ''}/auth/password-recovery-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          social: recoverySocial.trim(),
          phone: recoveryPhone.trim()
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Request failed');
      }
      setRecoveryDone('Заявка отправлена.');
      setRecoveryEmail('');
      setRecoverySocial('');
      setRecoveryPhone('');
    } catch (err: any) {
      setRecoveryError(err?.message || 'Ошибка отправки заявки');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#141417] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="mb-10 text-center">
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/30">Imperial Pure Gold</div>
          <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-black mt-3">Вход в кабинет</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
              Email / Telegram / Телефон
            </label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#d4af37]/60"
              placeholder="@telegram_username или email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
              Пароль
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#d4af37]/60"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => { window.location.href = registrationUrl; }}
              className="text-sm text-white/55 hover:text-[#d4af37] transition-colors"
            >
              Нет аккаунта? Регистрация
            </button>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setRecoveryOpen(true)}
                className="text-sm text-white/55 hover:text-[#d4af37] transition-colors"
              >
                Восстановить пароль
              </button>
            </div>
          </div>
        </form>
      </div>

      {recoveryOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#141417] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-['Playfair_Display'] font-bold">Восстановление пароля</h2>
              <button
                type="button"
                className="text-white/60 hover:text-white"
                onClick={() => {
                  setRecoveryOpen(false);
                  setRecoveryError('');
                  setRecoveryDone('');
                }}
              >
                x
              </button>
            </div>
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#d4af37]/60"
                placeholder="Почта"
              />
              <input
                type="text"
                required
                value={recoverySocial}
                onChange={(e) => setRecoverySocial(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#d4af37]/60"
                placeholder="Telegram / Facebook / WhatsApp"
              />
              <input
                type="text"
                required
                value={recoveryPhone}
                onChange={(e) => setRecoveryPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#d4af37]/60"
                placeholder="Телефон"
              />
              {recoveryError && <div className="text-red-400 text-sm">{recoveryError}</div>}
              {recoveryDone && <div className="text-green-400 text-sm">{recoveryDone}</div>}
              <button
                type="submit"
                disabled={recoveryLoading}
                className="w-full gold-gradient text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all disabled:opacity-60"
              >
                {recoveryLoading ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<LoginApp />);
