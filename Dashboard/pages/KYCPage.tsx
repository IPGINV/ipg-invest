import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Check, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { locales } from '../locales';
import { User } from '../types';

interface KYCPageProps {
  user: User;
  lang: 'en' | 'ru';
  loading?: boolean;
  verificationError?: string;
  completeKyc: (payload: {
    surname: string;
    name: string;
    email: string;
    phone: string;
    documentFile: File | null;
  }) => Promise<void>;
}

export function KYCPage({
  user,
  lang,
  loading = false,
  verificationError,
  completeKyc
}: KYCPageProps) {
  const [formData, setFormData] = useState({
    surname: (user.fullName || '').split(' ').slice(0, 1).join(' ') || '',
    name: (user.fullName || '').split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const t = locales[lang];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async () => {
    setError('');
    setSuccess('');
    if (!formData.surname.trim() || !formData.name.trim() || !formData.phone.trim()) {
      setError(lang === 'ru' ? 'Заполните фамилию, имя и телефон' : 'Fill surname, name and phone');
      return;
    }
    if (!file) {
      setError(lang === 'ru' ? 'Загрузите документ перед отправкой' : 'Upload a document before submitting');
      return;
    }
    try {
      await completeKyc({
        surname: formData.surname.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        documentFile: file
      });
      setSuccess(
        lang === 'ru'
          ? 'Данные отправлены. Ожидайте проверку модератором в админ-панели.'
          : 'Data submitted. Please wait for admin verification.'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'KYC save failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="luxury-card overflow-hidden rounded-[2.5rem] shadow-xl border border-stone-100"
    >
      <div className="p-8 md:p-10 border-b border-stone-100 bg-gradient-to-br from-stone-50/80 to-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-['Playfair_Display'] font-bold text-stone-900">
              {t.kycIdentityVerification}
            </h1>
            <p className="text-stone-500 text-sm mt-1">{t.kycFormSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-6">
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

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        {verificationError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {verificationError}
          </div>
        )}
      </div>

      <div className="p-8 md:p-10 pt-0">
        <button
          onClick={handleFormSubmit}
          disabled={loading || !formData.surname || !formData.name || !formData.phone || !file}
          className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold uppercase tracking-wide hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {t.kycCompleteVerification}
        </button>
      </div>
    </motion.div>
  );
}
