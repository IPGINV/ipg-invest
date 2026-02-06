import React from 'react';
import { DollarSign, Info } from 'lucide-react';

interface NumberInputProps {
  label: string;
  value: number | string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  error?: string;
}

export const CurrencyInput: React.FC<NumberInputProps> = ({ label, value, onChange, min, max, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric chars for processing
    const val = e.target.value.replace(/[^0-9]/g, '');
    onChange(Number(val));
  };

  // Format display value with commas
  const displayValue = value ? Number(value).toLocaleString('en-US') : '';

  return (
    <div className="w-full mb-6">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <DollarSign className="h-4 w-4 text-gold" />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors font-mono`}
          placeholder="10,000"
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-400 flex items-center">
          <Info className="w-3 h-3 mr-1" /> {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-500">Мин: ${min?.toLocaleString()} • Макс: ${max ? (max / 1000000) + 'M' : ''}</p>
      )}
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  subtitle?: string;
}

export const RangeSlider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step = 1, suffix = '', subtitle }) => {
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-end mb-4">
        <div>
            <label className="block text-sm font-medium text-gray-400">{label}</label>
            {subtitle && <p className="text-xs text-gold mt-1">{subtitle}</p>}
        </div>
        <span className="text-xl font-bold font-serif text-white">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between mt-2 text-xs text-gray-600 font-mono">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
      <span className="text-sm font-medium text-white">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#141417] ${
          checked ? 'bg-gold' : 'bg-gray-700'
        }`}
      >
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
    </div>
  );
};