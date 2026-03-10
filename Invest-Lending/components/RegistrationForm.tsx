import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Lock, Chrome, Send, ChevronRight, ArrowLeft, X } from 'lucide-react';

type Lang = 'RU' | 'EN';
type Translations = Record<string, string | string[]>;

interface RegistrationFormProps {
  lang: Lang;
  t: Translations;
  lockedAmount: number | null;
  resolveApiBase: () => string;
  resolveLocalBase: (port: number) => string | null;
  buildLoginUrl: (flow?: string) => string;
  onBack?: () => void;
  envDashboard?: string;
  onOfferModalVisibilityChange?: (open: boolean) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  lang,
  t,
  lockedAmount,
  resolveApiBase,
  resolveLocalBase,
  buildLoginUrl,
  onBack,
  envDashboard,
  onOfferModalVisibilityChange
}) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerText, setOfferText] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState('');
  const registrationUrl = 'http://localhost:5192/?step%3DREGISTRATION';

  const offerLines = useMemo(
    () => offerText.split('\n').map((line) => line.trim()).filter(Boolean),
    [offerText]
  );

  const offerSections = useMemo(() => {
    const isTopLevelNumberedHeading = (line: string) => /^\d+\.\s+\S+/.test(line);
    const isAllCapsHeading = (line: string) =>
      /^(?!\d)(?=.*[A-ZА-ЯЁ])[A-ZА-ЯЁ0-9\s"«»\-()]+$/.test(line) && line.length >= 6;

    return offerLines
      .map((line, index) => {
        if (!isTopLevelNumberedHeading(line) && !isAllCapsHeading(line)) return null;
        const id = `offer-section-${index}`;
        return { id, line };
      })
      .filter((item): item is { id: string; line: string } => Boolean(item))
      .slice(0, 30);
  }, [offerLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const base = resolveApiBase();

    try {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(new Error('Registration timeout')), 30000);
      const res = await fetch(`${base}/auth/register/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: 'Investor',
          phone: undefined,
          agree_terms: agreeTerms
        }),
        signal: ctrl.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Registration failed');
      }

      const data = await res.json().catch(() => ({}));
      if (data.tokens?.accessToken) {
        const dashboardBase = envDashboard || resolveLocalBase(3000) || 'https://dashboard.ipg-invest.ae';
        const authPayload = {
          t: data.tokens.accessToken,
          r: data.tokens.refreshToken || '',
          u: String(data.user?.id || ''),
          s: data.user?.status || 'active',
          o: data.user?.onboarding_step || 'registered'
        };
        const authHash = btoa(unescape(encodeURIComponent(JSON.stringify(authPayload))));
        const dashboardUrl = `${dashboardBase.replace(/\/$/, '')}/#auth=${authHash}`;
        window.location.replace(dashboardUrl);
      } else {
        const loginUrl = buildLoginUrl('kyc');
        const url = new URL(loginUrl);
        url.searchParams.set('email', email.trim());
        window.location.replace(url.toString());
      }
    } catch (err: any) {
      setLoading(false);
      const isAbort = err?.name === 'AbortError' || err?.message?.includes('abort') || err?.message?.includes('timeout');
      const msg = isAbort
        ? (lang === 'RU' ? 'Превышено время ожидания. Попробуйте снова.' : 'Request timed out. Please try again.')
        : (err?.message || 'Registration failed');
      const isNetwork = isAbort || msg.includes('fetch') || msg.includes('Failed to fetch') || msg === 'Registration failed';
      setError(
        isNetwork
          ? (lang === 'RU' ? 'Ошибка сети или таймаут. Попробуйте позже.' : 'Network error or timeout. Please try again later.')
          : msg
      );
    }
  };

  const handleLoginToggle = () => {
    if (isLogin) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  };

  const handleTelegramRegister = async () => {
    if (telegramLoading) return;
    setTelegramLoading(true);
    setError('');
    try {
      const base = resolveApiBase();
      const res = await fetch(`${base}/auth/telegram/register-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || 'Telegram link request failed');
      }

      const link = body?.bot_link || 'https://t.me/GoldenShareClub?start=register';
      window.open(link, '_blank', 'noopener,noreferrer');
      setError(
        lang === 'RU'
          ? 'Ссылка отправлена через бота. Проверьте Telegram и продолжите регистрацию по инструкции.'
          : 'The link has been sent via bot. Check Telegram and follow the instructions.'
      );
    } catch (err: any) {
      setError(err?.message || 'Telegram link request failed');
    } finally {
      setTelegramLoading(false);
    }
  };

  const openOfferModal = async () => {
    setIsOfferModalOpen(true);
    setOfferLoading(true);
    setOfferError('');
    const offerFile = lang === 'RU' ? 'offer-ru.txt' : 'offer-en.txt';
    try {
      const res = await fetch(`/legal/${offerFile}`);
      if (!res.ok) {
        throw new Error('Failed to load offer text');
      }
      const text = await res.text();
      setOfferText(text);
    } catch {
      setOfferError(
        lang === 'RU'
          ? 'Не удалось загрузить текст оферты. Попробуйте позже.'
          : 'Could not load the offer text. Please try again later.'
      );
    } finally {
      setOfferLoading(false);
    }
  };

  useEffect(() => {
    if (!isOfferModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOfferModalOpen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOfferModalOpen]);

  useEffect(() => {
    onOfferModalVisibilityChange?.(isOfferModalOpen);
  }, [isOfferModalOpen, onOfferModalVisibilityChange]);

  useEffect(() => {
    return () => {
      onOfferModalVisibilityChange?.(false);
    };
  }, [onOfferModalVisibilityChange]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="min-h-[100dvh] w-full flex flex-col md:min-h-0 md:py-8">
      {/* Mobile: full-screen layout with scroll */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden w-full md:justify-center">
        <div className="w-full max-w-md mx-auto flex flex-col flex-1 md:flex-initial px-4 py-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom)+1rem)] md:px-6 md:py-4 relative">
          {/* Background accent */}
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.06),transparent_55%)]" aria-hidden />

          <div className="relative z-10 flex flex-col">
            {/* Back button - mobile-friendly tap target */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="self-start flex items-center gap-2 min-h-[44px] min-w-[44px] py-2 pr-4 -ml-1 mb-4 md:mb-6 text-white/50 hover:text-white active:text-white text-sm font-bold transition-colors touch-manipulation"
                aria-label={t.regBtnBack as string}
              >
                <ArrowLeft size={20} />
                <span>{t.regBtnBack as string}</span>
              </button>
            )}

            {/* Card - design from Registration/Auth, full width on mobile */}
            <div className="glass-card rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl w-full">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white font-['Playfair_Display']">
                  {isLogin ? (lang === 'RU' ? 'С возвращением' : 'Welcome back') : (t.regFormTitle as string)}
                </h2>
                <p className="text-white/40 text-sm md:text-base">
                  {isLogin ? (lang === 'RU' ? 'Войдите в свой личный кабинет' : 'Sign in to your dashboard') : (lang === 'RU' ? 'Начните инвестировать в золото сегодня' : 'Start investing in gold today')}
                </p>
              </div>

              {lockedAmount !== null && (
                <div className="mb-6 text-center py-3 px-4 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/20">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">
                    {lang === 'RU' ? 'Сумма инвестиций' : 'Investment Amount'}
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-[#d4af37] tracking-tighter">
                    ${lockedAmount.toLocaleString()}
                  </div>
                </div>
              )}

              <form className="space-y-5" onSubmit={isLogin ? (e) => { e.preventDefault(); window.location.href = buildLoginUrl(); } : handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="reg-email" className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-1">
                    {(t.regLabelEmail as string)}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} aria-hidden />
                    <input
                      id="reg-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full min-h-[48px] md:min-h-[52px] bg-white/5 border border-white/10 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-base md:text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-all text-white placeholder:text-white/30 touch-manipulation"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password" className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-1">
                    {(t.regLabelPassword as string)}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} aria-hidden />
                    <input
                      id="reg-password"
                      type="password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isLogin}
                      minLength={isLogin ? undefined : 8}
                      className="w-full min-h-[48px] md:min-h-[52px] bg-white/5 border border-white/10 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-base md:text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-all text-white placeholder:text-white/30 touch-manipulation"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="flex items-start gap-3 py-3 min-h-[44px]">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded border-white/10 bg-white/5 accent-[#d4af37] flex-shrink-0 cursor-pointer"
                      id="terms"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <div className="text-[11px] md:text-xs text-white/40 leading-relaxed select-none">
                      <label htmlFor="terms" className="cursor-pointer">
                        {(t.regLabelTerms as string)}{' '}
                      </label>
                      <button
                        type="button"
                        onClick={openOfferModal}
                        className="text-[#d4af37] hover:underline transition-colors font-semibold"
                      >
                        {(t.regLinkOffer as string)}
                      </button>{' '}
                      <label htmlFor="terms" className="cursor-pointer">
                        {lang === 'RU' ? 'и условиями обработки данных.' : 'and data processing terms.'}
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[52px] md:min-h-[56px] gold-gradient text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                >
                  <span>
                    {loading
                      ? (lang === 'RU' ? 'Отправка...' : 'Sending...')
                      : isLogin
                        ? (lang === 'RU' ? 'Войти' : 'Sign in')
                        : (lang === 'RU' ? 'Создать аккаунт' : 'Create Account')}
                  </span>
                  <ChevronRight size={20} />
                </button>

                {isLogin && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => window.location.href = registrationUrl}
                      className="text-[12px] md:text-sm text-white/55 hover:text-[#d4af37] transition-colors"
                    >
                      {lang === 'RU' ? 'Нет аккаунта? Регистрация' : "Don't have an account? Registration"}
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-8">
                <div className="relative flex items-center justify-center mb-6 md:mb-8">
                  <div className="absolute w-full h-[1px] bg-white/5" />
                  <span className="relative bg-[#0c0c0e] px-4 text-[10px] font-mono uppercase tracking-widest text-white/20">
                    {(t.regFormOr as string)} {lang === 'RU' ? 'через' : 'via'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { icon: Chrome, label: 'Google', onClick: undefined as undefined | (() => void), disabled: true },
                    { icon: Send, label: 'Telegram', onClick: handleTelegramRegister, disabled: telegramLoading },
                  ].map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      onClick={social.onClick}
                      disabled={social.disabled}
                      className="flex flex-col items-center justify-center min-h-[56px] md:min-h-[64px] p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 transition-all group touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <social.icon size={22} className="text-white/40 group-hover:text-[#d4af37] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {!isLogin && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={handleLoginToggle}
                    className="min-h-[44px] px-4 py-2 text-[11px] md:text-xs font-bold uppercase tracking-widest text-white/40 hover:text-[#d4af37] active:text-[#d4af37] transition-colors touch-manipulation"
                  >
                    {lang === 'RU' ? 'Уже есть аккаунт? Войти' : 'Already have an account? Sign in'}
                  </button>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="mt-6 md:mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/20 px-4 py-3 rounded-full">
                  <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">Bonus</span>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{lang === 'RU' ? '+1 GHS токен за регистрацию' : '+1 GHS Token for registration'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-[1300] bg-black/75 backdrop-blur-sm p-3 md:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl h-[88vh] md:h-[82vh] glass-card border border-[#d4af37]/25 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden shadow-2xl shadow-black/50">
            <div className="px-4 md:px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base md:text-lg font-black uppercase tracking-wide text-white">
                  {lang === 'RU' ? 'Публичная оферта' : 'Investment Offer'}
                </h3>
                <p className="text-[11px] md:text-xs text-white/40 mt-1">
                  {lang === 'RU' ? 'Договор инвестирования и условия конфиденциальности' : 'Investment agreement and confidentiality terms'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="min-h-[40px] min-w-[40px] rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-colors flex items-center justify-center"
                aria-label={t.legalModalClose as string}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 md:px-7 py-5 md:py-6">
              {offerLoading ? (
                <p className="text-white/60 text-sm">{lang === 'RU' ? 'Загрузка...' : 'Loading...'}</p>
              ) : offerError ? (
                <p className="text-red-300 text-sm">{offerError}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] gap-4 md:gap-6">
                  <aside className="md:sticky md:top-0 md:self-start rounded-2xl border border-white/10 bg-black/20 p-3 md:p-4 h-fit">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">
                      {lang === 'RU' ? 'Оглавление' : 'Contents'}
                    </p>
                    <div className="max-h-[28vh] md:max-h-[58vh] overflow-y-auto space-y-1.5 pr-1">
                      {offerSections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className="w-full text-left text-[11px] md:text-xs text-white/65 hover:text-[#d4af37] transition-colors leading-snug"
                        >
                          {section.line}
                        </button>
                      ))}
                    </div>
                  </aside>
                  <div className="space-y-3 text-sm md:text-[15px] leading-relaxed text-white/80">
                    {offerLines.map((line, index) => {
                      const section = offerSections.find((item) => item.id === `offer-section-${index}`);
                      const isMajorHeading = section && !/^\d+\.\d+/.test(line);
                      return (
                        <p
                          key={`${index}-${line.slice(0, 16)}`}
                          id={section?.id}
                          className={
                            isMajorHeading
                              ? 'pt-2 text-[#f4d27a] font-bold uppercase tracking-wide'
                              : section
                                ? 'pt-1 text-white font-semibold'
                                : ''
                          }
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 md:px-6 py-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="min-h-[42px] px-5 rounded-xl bg-white/5 border border-white/15 text-white/70 hover:text-[#d4af37] hover:border-[#d4af37]/40 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                {t.legalModalClose as string}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
