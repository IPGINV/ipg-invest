import React, { useMemo } from 'react';

type Props = {
  lang: 'ru' | 'en';
  onEmail: () => Promise<void>;
  onTelegram: () => void;
  onContinue: () => Promise<void>;
  loading?: boolean;
  hint?: string;
};

const ContactBinding: React.FC<Props> = ({ lang, onEmail, onTelegram, onContinue, loading = false, hint }) => {
  const labels = useMemo(
    () =>
      lang === 'ru'
        ? {
            title: 'Привязка контакта',
            desc: 'Подтвердите Email или Telegram перед переходом к оплате',
            email: 'Подтвердить Email',
            telegram: 'Привязать Telegram',
            continue: 'Я подтвердил, продолжить'
          }
        : {
            title: 'Contact binding',
            desc: 'Verify Email or Telegram before payment',
            email: 'Verify Email',
            telegram: 'Bind Telegram',
            continue: 'I have completed verification'
          },
    [lang]
  );

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">{labels.title}</h2>
      <p className="text-sm text-gray-500 mt-2 mb-6">{labels.desc}</p>
      {hint && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">{hint}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => void onEmail()}
          className="px-6 py-3 rounded-2xl bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800"
        >
          {labels.email}
        </button>
        <button
          type="button"
          onClick={onTelegram}
          className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-50"
        >
          {labels.telegram}
        </button>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => void onContinue()}
        className="mt-6 px-6 py-3 rounded-2xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 disabled:opacity-60"
      >
        {labels.continue}
      </button>
    </div>
  );
};

export default ContactBinding;
