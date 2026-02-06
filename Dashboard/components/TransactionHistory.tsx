
import React from 'react';
import { Transaction } from '../types';
import { locales } from '../locales';
import { formatCurrency } from '../services/calcService';

interface TransactionHistoryProps {
  transactions: Transaction[];
  lang: 'en' | 'ru';
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, lang }) => {
  const t = locales[lang];

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100/80 text-green-700 ring-green-200';
      case 'pending':
        return 'bg-amber-100/80 text-amber-700 ring-amber-200';
      case 'failed':
        return 'bg-red-100/80 text-red-700 ring-red-200';
      default:
        return 'bg-gray-100 text-gray-700 ring-gray-200';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return t.statusCompleted;
      case 'pending': return t.statusPending;
      case 'failed': return t.statusFailed;
      default: return status;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'fa-arrow-down-to-bracket text-blue-500 bg-blue-50';
      case 'withdrawal': return 'fa-arrow-up-from-bracket text-purple-500 bg-purple-50';
      case 'yield': return 'fa-chart-line text-green-500 bg-green-50';
      default: return 'fa-circle-dot text-gray-400 bg-gray-50';
    }
  };

  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return t.typeDeposit;
      case 'withdrawal': return t.typeWithdrawal;
      case 'yield': return t.typeYield;
      default: return type;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="bg-gray-50/50 px-6 md:px-8 py-5 border-b border-gray-100">
          <h3 className="font-black text-sm uppercase tracking-tight text-gray-800">{t.history}</h3>
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/20">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t.transDate}</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t.transType}</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t.transAmount}</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t.transStatus}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-600 tracking-tight">{tx.date}</span>
                  </td>
                  <td className="px-8 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeIcon(tx.type).split(' ').slice(1).join(' ')} shadow-sm`}>
                        <i className={`fa-solid ${getTypeIcon(tx.type).split(' ')[0]} text-xs`}></i>
                      </div>
                      <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{getTypeText(tx.type)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 border-b border-gray-100">
                    <span className={`text-sm font-black ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-5 border-b border-gray-100">
                    <span className={`px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-widest ring-1 ${getStatusStyle(tx.status)}`}>
                      {getStatusText(tx.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-6 active:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeIcon(tx.type).split(' ').slice(1).join(' ')} shadow-sm`}>
                    <i className={`fa-solid ${getTypeIcon(tx.type).split(' ')[0]} text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{getTypeText(tx.type)}</p>
                    <p className="text-xs font-bold text-gray-600">{tx.date}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[8px] uppercase font-black tracking-widest ring-1 ${getStatusStyle(tx.status)}`}>
                  {getStatusText(tx.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.transAmount}</span>
                <span className={`text-lg font-black ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
