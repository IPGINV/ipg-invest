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
    <div className="w-full h-[400px] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif font-bold text-white">Динамика роста портфеля</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold"></span>
            <span className="text-gray-400">Общая стоимость</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-gray-400">Основной капитал</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="stageNumber" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            label={{ value: 'Циклы', position: 'insideBottomRight', offset: -5, fill: '#666' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={12} 
            tickFormatter={formatCompactNumber}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1c1c21', 
              borderColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: '#fff' }}
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