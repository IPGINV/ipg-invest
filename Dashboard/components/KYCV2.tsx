import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Check, Mail, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { locales } from '../locales';
import { User } from '../types';

interface KYCV2Props {
  user: User;
  lang: 'en' | 'ru';
  loading?: boolean;
  completeKyc: (payload: {
    surname: string;
    name: string;
    email: string;
    phone: string;
    documentFileName: string;
  }) => Promise<void>;
  onComplete: () => void;
  onSkip: () => void;
  onEmailResend: () => Promise<void>;
  onTelegramOpen: () => void;
}

const KYCV2: React.FC<KYCV2Props> = ({
  user,
  lang,
  loading = false,
  completeKyc,
  onComplete,
  onSkip,
  onEmailResend,
  onTelegramOpen
}) => {
  const [step, setStep] = useState<'form' | 'binding'>('form');
  const t = locales[lang];

  const [formData, setFormData] = useState({
    surname: (user.fullName || '').split(' ').slice(0, 1).join(' ') || '',
    name: (user.fullName || '').split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState('');
  const [bindingMethod, setBindingMethod] = useState<'email' | 'telegram' | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      setDocumentFileName(f.name);
    }
  };

  const handleFormSubmit = async () => {
    setError('');
    if (!formData.surname.trim() || !formData.name.trim() || !formData.email.trim()) {
      setError(lang === 'ru' ? 'Заполните обязательные поля' : 'Fill required fields');
      return;
    }
    try {
      await completeKyc({
        surname: formData.surname.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        documentFileName
      });
      setStep('binding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'KYC save failed');
    }
  };

  const handleResendEmail = async () => {
    setError('');
    try {
      await onEmailResend();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    }
  };

  const handleOpenTelegram = () => {
    onTelegramOpen();
  };

  const handleBindingComplete = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#f5f5f7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              {step === 'form' ? t.kycIdentityVerification : t.kycSecureBinding}
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              {step === 'form' ? t.kycFormSubtitle : t.kycBindingSubtitle}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-stone-400 hover:text-stone-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors"
          >
            {t.kycCompleteLater}
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {step === 'form' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t.kycSurname}
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="input-luxury p-4"
                    placeholder={t.kycSurname}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t.kycName}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-luxury p-4"
                    placeholder={t.kycName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-luxury p-4"
                    placeholder={t.email}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {t.kycPhone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-luxury p-4"
                    placeholder={t.kycPhone}
                  />
                </div>
              </div>

              <div className="pt-4">
                <label className="block w-full cursor-pointer group">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all',
                      file
                        ? 'border-green-200 bg-green-50'
                        : 'border-stone-200 bg-stone-50 group-hover:border-[#d4af37]/50 group-hover:bg-[#d4af37]/5'
                    )}
                  >
                    {file ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                          <Check size={24} />
                        </div>
                        <p className="font-medium text-stone-900">{file.name}</p>
                        <p className="text-xs text-green-600 mt-1">{t.kycDocumentUploaded}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white text-stone-400 shadow-sm flex items-center justify-center mb-3 group-hover:text-[#d4af37] transition-colors">
                          <Upload size={24} />
                        </div>
                        <p className="font-medium text-stone-900">{t.uploadDocument}</p>
                        <p className="text-xs text-stone-400 mt-1">{t.uploadDocumentHint}</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setBindingMethod('email')}
                  className={cn(
                    'p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden',
                    bindingMethod === 'email'
                      ? 'border-[#d4af37] bg-[#d4af37]/5'
                      : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-900 mb-4">
                    <Mail size={20} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    {t.kycEmailVerification}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">{t.kycBindingEmailDesc}</p>
                </button>

                <button
                  onClick={() => setBindingMethod('telegram')}
                  className={cn(
                    'p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden',
                    bindingMethod === 'telegram'
                      ? 'border-[#229ED9] bg-[#229ED9]/5'
                      : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[#229ED9] shadow-sm flex items-center justify-center text-white mb-4">
                    <Send size={20} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    {t.kycTelegramBot}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">{t.kycBindingTelegramDesc}</p>
                </button>
              </div>

              {bindingMethod === 'email' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800"
                >
                  <p>
                    {t.kycVerificationLinkSent} <strong>{formData.email}</strong>.{' '}
                    {lang === 'ru' ? 'Перейдите по ссылке.' : 'Please click the link.'}
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {lang === 'ru' ? 'Отправить снова' : 'Resend Email'}
                  </button>
                </motion.div>
              )}

              {bindingMethod === 'telegram' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800"
                >
                  <p>
                    {lang === 'ru'
                      ? 'Откройте бота GoldenShareClub и завершите привязку.'
                      : 'Please open our bot and click "Start" to link your account.'}
                  </p>
                  <button
                    onClick={handleOpenTelegram}
                    className="mt-3 px-4 py-2 bg-[#229ED9] text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#1e8dbf] transition-colors"
                  >
                    {t.kycOpenTelegramBot}
                  </button>
                </motion.div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 mt-auto">
          {step === 'form' ? (
            <button
              onClick={handleFormSubmit}
              disabled={loading || !formData.surname || !formData.name || !formData.email}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold uppercase tracking-wide hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {t.kycConfirm}
            </button>
          ) : (
            <button
              onClick={handleBindingComplete}
              disabled={!bindingMethod}
              className="w-full bg-gold-gradient text-stone-900 py-4 rounded-2xl font-bold uppercase tracking-wide hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#d4af37]/20"
            >
              {t.kycCompleteVerification}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KYCV2;
