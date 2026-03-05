import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { CalculationStage } from '../types';
import { formatCompactNumber, formatCurrency } from '../utils/formatters';

interface Props {
  stages: CalculationStage[];
  initialInvestment: number;
}

export const GrowthChart: React.FC<Props> = ({ stages, initialInvestment }) => {
  // Prepend initial state
  const data = [
    {
      stageNumber: 0,
      totalValue: initialInvestment,
      principalAtEnd: initialInvestment,
      withdrawn: 0
    },
    ...stages
  ];

  return (
    <div className="w-full h-[420px] representative-card p-6 chart-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="card-badge">Динамика роста портфеля</span>
        </div>
        <div className="flex gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#d4af37] shadow-sm"></span>
            <span className="text-slate-500 font-medium">Общая стоимость</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span className="text-slate-500 font-medium">Основной капитал</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.35}/>
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis 
            dataKey="stageNumber" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            label={{ value: 'Циклы', position: 'insideBottomRight', offset: -5, fill: '#64748b' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickFormatter={formatCompactNumber}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderColor: 'rgba(0,0,0,0.1)', 
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: '#0f172a' }}
            formatter={(value: number) => [formatCurrency(value), '']}
            labelFormatter={(label) => `Цикл ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="totalValue" 
            stroke="#d4af37" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            name="Общая стоимость"
          />
          <Line 
            type="monotone" 
            dataKey="principalAtEnd" 
            stroke="#10b981" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            name="Активный капитал"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};