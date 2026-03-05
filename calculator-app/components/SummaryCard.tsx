import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { CalculationResult } from '../types';
import { TrendingUp, Wallet, ArrowUpRight, Percent } from 'lucide-react';

interface Props {
  data: CalculationResult;
}

export const SummaryCard: React.FC<Props> = ({ data }) => {
  const totalValue = data.finalValue + data.totalWithdrawn;
  const profit = totalValue - data.totalInvested;

  const metrics = [
    {
      label: "Начальная инвестиция",
      value: formatCurrency(data.totalInvested),
      icon: <Wallet className="w-6 h-6 text-[#d4af37]" />,
      subtext: "Основной капитал"
    },
    {
      label: "Финальная стоимость",
      value: formatCurrency(totalValue),
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      subtext: "Активы + выведенная прибыль"
    },
    {
      label: "Чистая прибыль",
      value: formatCurrency(profit),
      icon: <ArrowUpRight className="w-6 h-6 text-blue-600" />,
      subtext: `Выведено: ${formatCurrency(data.totalWithdrawn)}`
    },
    {
      label: "ROI",
      value: formatPercentage(data.roi),
      icon: <Percent className="w-6 h-6 text-violet-600" />,
      subtext: `Множитель: ${data.multiplier.toFixed(2)}x`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {metrics.map((metric, idx) => (
        <div 
          key={idx} 
          className="representative-card p-6 hover:shadow-lg hover:border-[#d4af37]/25 transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-5">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-3 opacity-90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                {metric.label}
              </div>
              <h3 className="text-2xl md:text-3xl font-black font-serif text-slate-900 tracking-tight">{metric.value}</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">{metric.subtext}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/60 flex items-center justify-center flex-shrink-0 shadow-sm">
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};