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
  };
};

const LoginApp: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiBase = useMemo(() => {
    return (window as any).__IPG_API_BASE || 'http://localhost:3001';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Login failed');
      }

      const data: LoginResult = await res.json();
      localStorage.setItem('ipg_token', data.tokens.accessToken);
      localStorage.setItem('ipg_refresh_token', data.tokens.refreshToken);
      localStorage.setItem('ipg_user_id', String(data.user.id));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
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
              Почта или Telegram ID
            </label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#d4af37]/60"
              placeholder="email@example.com или @telegram"
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
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<LoginApp />);
