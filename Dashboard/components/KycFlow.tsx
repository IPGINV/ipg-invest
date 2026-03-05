import React, { useMemo, useState } from 'react';
import { User } from '../types';

type Props = {
  user: User;
  lang: 'ru' | 'en';
  onSubmit: (payload: {
    surname: string;
    name: string;
    email: string;
    phone: string;
    documentFileName: string;
  }) => Promise<void>;
  onSkip: () => void;
  loading?: boolean;
};

const KycFlow: React.FC<Props> = ({ user, lang, onSubmit, onSkip, loading = false }) => {
  const [surname, setSurname] = useState(() => (user.fullName || '').split(' ').slice(0, 1).join(' '));
  const [name, setName] = useState(() => (user.fullName || '').split(' ').slice(1).join(' '));
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [documentFileName, setDocumentFileName] = useState('');
  const [error, setError] = useState('');

  const labels = useMemo(
    () =>
      lang === 'ru'
        ? {
            title: 'KYC верификация',
            subtitle: 'Заполните данные перед первым пополнением контракта',
            surname: 'Фамилия',
            name: 'Имя',
            email: 'Почта',
            phone: 'Телефон',
            upload: 'Загрузить документ (ID/Passport)',
            confirm: 'Подтвердить',
            skip: 'Пройди позже'
          }
        : {
            title: 'KYC Verification',
            subtitle: 'Fill the data before your first contract top-up',
            surname: 'Surname',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            upload: 'Upload document (ID/Passport)',
            confirm: 'Confirm',
            skip: 'Do later'
          },
    [lang]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!surname.trim() || !name.trim() || !email.trim()) {
      setError(lang === 'ru' ? 'Заполните обязательные поля' : 'Fill required fields');
      return;
    }
    try {
      await onSubmit({
        surname: surname.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        documentFileName
      });
    } catch (err: any) {
      setError(err?.message || (lang === 'ru' ? 'Ошибка сохранения KYC' : 'KYC save failed'));
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">{labels.title}</h2>
      <p className="text-sm text-gray-500 mt-2 mb-8">{labels.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{labels.surname}</label>
            <input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{labels.name}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{labels.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{labels.phone}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-700 cursor-pointer">
            {labels.upload}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setDocumentFileName(file?.name || '');
              }}
            />
          </label>
          {documentFileName && <p className="mt-2 text-xs text-gray-500">Selected: {documentFileName}</p>}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 disabled:opacity-60"
          >
            {labels.confirm}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-50"
          >
            {labels.skip}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KycFlow;
