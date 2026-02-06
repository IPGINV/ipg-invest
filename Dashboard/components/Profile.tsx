
import React, { useState } from 'react';
import { User } from '../types';
import { locales } from '../locales';

interface ProfileProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void> | void;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
  lang: 'en' | 'ru';
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onPasswordChange, lang }) => {
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(user.fullName);
  const [passportData, setPassportData] = useState(user.passportData);
  const [telegram, setTelegram] = useState(user.telegram);
  const [cryptoWallet, setCryptoWallet] = useState(user.cryptoWallet);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [passportDocumentName, setPassportDocumentName] = useState('');
  const t = locales[lang];

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ email });
      setStatus({ type: 'success', message: t.successEmail });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t.errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: t.errorPass });
      return;
    }
    try {
      await onPasswordChange(currentPassword, newPassword);
      setStatus({ type: 'success', message: t.successPass });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t.errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ fullName, passportData, telegram });
      setStatus({ type: 'success', message: t.successPersonal });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t.errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ cryptoWallet });
      setStatus({ type: 'success', message: t.successWallet });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || t.errorPass });
    } finally {
      setTimeout(() => setStatus(null), 4000);
    }
  };
  
  const handlePassportDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPassportDocumentName(file ? file.name : '');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-6 md:p-10">
        <div className="mb-10">
          <h2 className="text-xl md:text-2xl font-black mb-2 tracking-tight">{t.profile}</h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed">
            {lang === 'ru' ? 'Обновите персональные данные и настройки безопасности вашего аккаунта.' : 'Update your personal information and account security settings.'}
          </p>
        </div>

        {status && (
          <div className={`mb-8 p-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest flex items-center space-x-3 animate-in slide-in-from-top-4 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <i className={`fa-solid ${status.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-base`}></i>
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateEmail} className="mb-14">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[2px] bg-amber-500 rounded-full"></span>
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.accountInfo}</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.investorIdLabel}</label>
              <div className="relative">
                <i className="fa-solid fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input 
                  type="text"
                  value={user.investorId}
                  disabled
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.email}</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input 
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              {t.updateEmail}
            </button>
          </div>
        </form>

        <form onSubmit={handleUpdatePersonal} className="mb-14">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[2px] bg-amber-500 rounded-full"></span>
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.personalData}</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.fullName}</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.passportData}</label>
              <div className="relative">
                <i className="fa-solid fa-passport absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  value={passportData}
                  onChange={(e) => setPassportData(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.passportDocument}</label>
              <input
                id="passportDocument"
                type="file"
                accept="image/*,.pdf"
                onChange={handlePassportDocumentChange}
                className="hidden"
              />
              <label
                htmlFor="passportDocument"
                className="inline-flex items-center space-x-3 bg-white border border-gray-100 text-gray-700 px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] hover:bg-gray-50 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <i className="fa-solid fa-upload text-gray-400"></i>
                <span>{t.uploadDocument}</span>
              </label>
              <p className="mt-3 text-[10px] md:text-xs text-gray-400 font-medium">
                {passportDocumentName ? `${t.documentSelected}: ${passportDocumentName}` : t.uploadDocumentHint}
              </p>
            </div>

            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.telegram}</label>
              <div className="relative">
                <i className="fa-brands fa-telegram absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              {t.savePersonal}
            </button>
          </div>
        </form>

        <form onSubmit={handleUpdateWallet} className="mb-14">
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[2px] bg-amber-500 rounded-full"></span>
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.cryptoWallet}</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.walletAddress}</label>
              <div className="relative">
                <i className="fa-solid fa-wallet absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  value={cryptoWallet}
                  onChange={(e) => setCryptoWallet(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              {t.linkWallet}
            </button>
          </div>
        </form>

        <form onSubmit={handleUpdatePassword}>
          <div className="flex items-center space-x-3 mb-6">
            <span className="w-8 h-[2px] bg-amber-500 rounded-full"></span>
            <h3 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.security}</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.currPass}</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input 
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.newPass}</label>
                <div className="relative">
                  <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.confPass}</label>
                <div className="relative">
                  <i className="fa-solid fa-shield absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>
            
            <button 
              type="submit"
              className="w-full md:w-auto bg-amber-600 text-white px-10 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] hover:bg-amber-700 active:scale-95 transition-all shadow-lg shadow-amber-600/20"
            >
              {t.changePass}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
