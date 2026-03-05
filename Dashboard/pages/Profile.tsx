import React, { useState } from 'react';
import { User, Shield, ChevronRight, FileText, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { User as UserType } from '../types';
import { locales } from '../locales';

interface ProfileProps {
  user: UserType;
  lang: 'en' | 'ru';
  onUpdate: (data: Partial<UserType>) => Promise<void> | void;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
  onTriggerKYC: () => void;
}

const t = (lang: 'en' | 'ru') => locales[lang];

export function ProfilePage({ user, lang, onUpdate, onPasswordChange, onTriggerKYC }: ProfileProps) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName);
  const [telegram, setTelegram] = useState(user.telegram);
  const [cryptoWallet, setCryptoWallet] = useState(user.cryptoWallet);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fullNameParts = (user.fullName || '').split(' ');
  const firstName = fullNameParts[0] || 'I';

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ email });
      setStatus({ type: 'success', message: t(lang).successEmail });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t(lang).errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ fullName: fullName, telegram });
      setStatus({ type: 'success', message: t(lang).successPersonal });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t(lang).errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ cryptoWallet });
      setStatus({ type: 'success', message: t(lang).successWallet });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t(lang).errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: t(lang).errorPass });
      return;
    }
    try {
      await onPasswordChange(currentPassword, newPassword);
      setStatus({ type: 'success', message: t(lang).successPass });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t(lang).errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-serif font-bold text-stone-900">{t(lang).profile}</h2>

      {status && (
        <div className={cn("p-4 rounded-2xl text-sm", status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
          {status.message}
        </div>
      )}

      <section className="luxury-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gold-gradient p-[1px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#d4af37] font-serif font-bold text-xl">
              {firstName.charAt(0)}
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg">{user.fullName || user.email}</h3>
            {user.investorId && (
              <p className="text-xs text-gray-400 uppercase tracking-widest">{user.investorId}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateEmail} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxury p-4 text-sm font-medium" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-black">
              {t(lang).updateEmail}
            </button>
          </div>
        </form>

        <form onSubmit={handleUpdatePersonal} className="space-y-6 mb-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).fullName}</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-luxury p-4 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).telegram}</label>
            <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} className="input-luxury p-4 text-sm" placeholder="@username" />
          </div>
          <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-black">
            {t(lang).savePersonal}
          </button>
        </form>

        <form onSubmit={handleUpdateWallet} className="space-y-4 mb-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).walletAddress}</label>
            <input type="text" value={cryptoWallet} onChange={(e) => setCryptoWallet(e.target.value)} className="input-luxury p-4 text-sm" placeholder="0x..." />
          </div>
          <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-black">
            {t(lang).linkWallet}
          </button>
        </form>
      </section>

      <section className="luxury-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Shield size={120} />
        </div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="font-serif font-bold text-lg mb-1">{t(lang).security}</h3>
            <p className="text-sm text-gray-500">
              {user.emailVerified
                ? (lang === 'ru' ? 'Идентичность подтверждена. Полный доступ.' : 'Your identity has been verified. You have full access.')
                : (lang === 'ru' ? 'Пройдите KYC для доступа к пополнению и выводу.' : 'Complete KYC to unlock deposits and withdrawals.')}
            </p>
          </div>
          {user.emailVerified ? (
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-green-100 flex items-center gap-1">
              <Check size={12} />
              Verified
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-amber-100">
              Pending
            </span>
          )}
        </div>

        {!user.emailVerified && (
          <div className="space-y-4 relative z-10">
            <button
              onClick={onTriggerKYC}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#d4af37] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-400 group-hover:text-[#d4af37] transition-colors" />
                <span className="text-sm font-medium">{lang === 'ru' ? 'Загрузить паспорт / ID' : 'Upload Passport / ID'}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
            <button
              onClick={onTriggerKYC}
              className="w-full bg-amber-600 text-white py-3 rounded-2xl font-medium hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
            >
              {lang === 'ru' ? 'Начать верификацию' : 'Start Verification'}
            </button>
          </div>
        )}
      </section>

      <section className="luxury-card p-6 md:p-8">
        <h3 className="font-serif font-bold text-lg mb-6">{t(lang).security}</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).currPass}</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-luxury p-4 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).newPass}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-luxury p-4 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t(lang).confPass}</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-luxury p-4 text-sm" />
          </div>
          <button type="submit" className="bg-amber-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-amber-700">
            {t(lang).changePass}
          </button>
        </form>
      </section>
    </div>
  );
}
