import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { formatCurrency } from '../services/calcService';
import { cn } from '../lib/utils';
import { Transaction } from '../types';
import { locales } from '../locales';

interface HistoryProps {
  transactions: Transaction[];
  lang: 'en' | 'ru';
}

const t = (lang: 'en' | 'ru') => locales[lang];

export function History({ transactions, lang }: HistoryProps) {
  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return { icon: ArrowDownLeft, cls: 'bg-blue-50 text-blue-600' };
      case 'withdrawal': return { icon: ArrowUpRight, cls: 'bg-purple-50 text-purple-600' };
      case 'yield': return { icon: Clock, cls: 'bg-green-50 text-green-600' };
      default: return { icon: Clock, cls: 'bg-gray-50 text-gray-600' };
    }
  };

  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return t(lang).typeDeposit;
      case 'withdrawal': return t(lang).typeWithdrawal;
      case 'yield': return t(lang).typeYield;
      default: return type;
    }
  };

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-600';
      case 'pending': return 'bg-amber-50 text-amber-600';
      case 'failed': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return t(lang).statusCompleted;
      case 'pending': return t(lang).statusPending;
      case 'failed': return t(lang).statusFailed;
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-stone-900">{t(lang).history}</h2>
      </div>

      <div className="hidden md:block luxury-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).transType}</th>
              <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).transDate}</th>
              <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).transAmount}</th>
              <th className="text-right py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t(lang).transStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const { icon: Icon, cls } = getTypeIcon(tx.type);
              return (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", cls)}>
                        <Icon size={16} />
                      </div>
                      <span className="font-medium capitalize text-sm">{getTypeText(tx.type)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">{tx.date}</td>
                  <td className={cn("py-4 px-6 text-right font-medium text-sm", tx.type === 'withdrawal' ? 'text-stone-900' : 'text-green-600')}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide", getStatusStyle(tx.status))}>
                      {getStatusText(tx.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {transactions.map((tx) => {
          const { icon: Icon, cls } = getTypeIcon(tx.type);
          return (
            <div key={tx.id} className="luxury-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", cls)}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-medium capitalize text-sm text-stone-900">{getTypeText(tx.type)}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-bold text-sm", tx.type === 'withdrawal' ? 'text-stone-900' : 'text-green-600')}>
                  {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                </p>
                <p className={cn("text-[10px] font-bold uppercase tracking-wide mt-1", getStatusStyle(tx.status))}>
                  {getStatusText(tx.status)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
