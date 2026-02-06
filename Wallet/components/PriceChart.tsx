import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeRange, ChartDataPoint } from '../types';
import { generateChartData } from '../constants';

interface PriceChartProps {
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  lang: string;
  data?: ChartDataPoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ range, setRange, lang, data }) => {
  const chartData = useMemo(
    () => (data && data.length ? data : generateChartData(range)),
    [data, range]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141417] border border-[#d4af37]/30 p-2 rounded shadow-xl backdrop-blur-md">
          <p className="text-[10px] text-white/60 mb-1">{label}</p>
          <p className="text-sm font-bold text-[#d4af37]">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full h-[400px] flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6 z-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">
          GHS Token Price
        </h3>
        <div className="flex bg-black/20 p-1 rounded-lg">
          {(['1D', '1W', '1M', '1Y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                range === r 
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}
              dy={10}
            />
            <YAxis 
              domain={['auto', 'auto']}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}}
              dx={10}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#d4af37" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
