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
      icon: <Wallet className="w-5 h-5 text-gold" />,
      subtext: "Основной капитал"
    },
    {
      label: "Финальная стоимость",
      value: formatCurrency(totalValue),
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      subtext: "Активы + выведенная прибыль"
    },
    {
      label: "Чистая прибыль",
      value: formatCurrency(profit),
      icon: <ArrowUpRight className="w-5 h-5 text-blue-400" />,
      subtext: `Выведено: ${formatCurrency(data.totalWithdrawn)}`
    },
    {
      label: "ROI",
      value: formatPercentage(data.roi),
      icon: <Percent className="w-5 h-5 text-purple-400" />,
      subtext: `Множитель: ${data.multiplier.toFixed(2)}x`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {metrics.map((metric, idx) => (
        <div 
          key={idx} 
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{metric.label}</p>
              <h3 className="text-2xl font-bold font-serif text-white">{metric.value}</h3>
              <p className="text-xs text-gray-400 mt-2">{metric.subtext}</p>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};