import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/utils';
import QRCode from 'qrcode';
import { locales } from '../locales';

// Wallet addresses from requirements
const CRYPTO_OPTIONS = [
  { id: 'USDT-TRC20', name: 'USDT (TRC20)', network: 'Tron', address: 'TVo3bVwAtvC316qMEn6ymidsXQjL3en3yy' },
  { id: 'USDC-ERC20', name: 'USDC (ERC20)', network: 'Ethereum', address: '0x4662c807c59412d24a52073f2d639ce4ebf0ca12e900b0d0140cef6b912c4ed1' }
];

interface PaymentPageProps {
  amount: number;
  lang: 'en' | 'ru';
  onClose: () => void;
  onSubmit?: (txId: string) => void | Promise<void>;
}

export function PaymentPage({ amount, lang, onClose, onSubmit }: PaymentPageProps) {
  const [selectedCrypto, setSelectedCrypto] = useState(CRYPTO_OPTIONS[0]);
  const [txId, setTxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = locales[lang];

  useEffect(() => {
    QRCode.toDataURL(selectedCrypto.address, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [selectedCrypto.address]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSubmit = async () => {
    if (!txId.trim()) {
      setSubmitError(lang === 'ru' ? 'Введите хэш транзакции (TXID)' : 'Enter transaction hash (TXID)');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await onSubmit?.(txId.trim());
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : (lang === 'ru' ? 'Ошибка отправки' : 'Submit failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0c0e]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              {lang === 'ru' ? 'Пополнение' : 'Deposit Funds'}
            </h3>
            <p className="text-stone-500 text-sm mt-1">
              {lang === 'ru' ? 'Сумма: ' : 'Amount: '}{formatCurrency(amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pt-4 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              {lang === 'ru' ? 'Выберите сеть' : 'Select Network'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CRYPTO_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedCrypto(option)}
                  className={cn(
                    'px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all',
                    selectedCrypto.id === option.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-lg'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-[#d4af37]'
                  )}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-100 rounded-3xl p-6 mb-6 flex flex-col items-center text-center">
            <div className="w-48 h-48 bg-white rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-stone-100">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-stone-200 rounded-xl" />
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3">
              {lang === 'ru' ? 'Отправьте только ' : 'Send only '}{selectedCrypto.name}
            </p>
            <div className="w-full relative group">
              <div className="w-full bg-white border border-stone-200 rounded-xl py-4 pl-4 pr-12 text-xs font-mono text-stone-600 break-all text-left">
                {selectedCrypto.address}
              </div>
              <button
                onClick={handleCopyAddress}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-colors"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              {lang === 'ru' ? 'Хэш транзакции (TXID)' : 'Transaction Hash (TXID)'}
            </label>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={lang === 'ru' ? 'Вставьте ID транзакции...' : 'Paste your transaction ID here...'}
              className="input-luxury p-4 text-sm"
            />
            <p className="text-xs text-stone-400 mt-3 leading-relaxed">
              {lang === 'ru'
                ? 'Администратор проверит платеж и подтвердит сумму. Баланс обновится после подтверждения.'
                : 'Administrator will verify the payment and confirm the amount. Balance will update after confirmation.'}
            </p>
            {submitError && (
              <p className="text-xs text-red-600 mt-2 font-medium">{submitError}</p>
            )}
          </div>
        </div>

        <div className="p-8 pt-0">
          <button
            onClick={handlePaymentSubmit}
            disabled={isSubmitting}
            className="w-full bg-gold-gradient text-stone-900 py-4 rounded-2xl font-bold uppercase tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#d4af37]/20"
          >
            {isSubmitting ? (lang === 'ru' ? 'Отправка...' : 'Submitting...') : (lang === 'ru' ? 'Я оплатил' : 'I have paid')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
