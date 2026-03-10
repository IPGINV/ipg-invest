import React, { useEffect, useState } from 'react';
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
  const [draftValue, setDraftValue] = useState(() => (value === '' || value === null || value === undefined ? '' : String(value)));

  useEffect(() => {
    const normalized = value === '' || value === null || value === undefined ? '' : String(value);
    setDraftValue((current) => (current === normalized ? current : normalized));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setDraftValue(digitsOnly);

    if (!digitsOnly) {
      return;
    }

    onChange(Number(digitsOnly));
  };

  const handleBlur = () => {
    if (!draftValue) {
      if (typeof min === 'number') {
        const normalizedMin = String(min);
        setDraftValue(normalizedMin);
        onChange(min);
      }
      return;
    }

    let normalizedValue = Number(draftValue);
    if (typeof min === 'number' && normalizedValue < min) normalizedValue = min;
    if (typeof max === 'number' && normalizedValue > max) normalizedValue = max;

    setDraftValue(String(normalizedValue));
    onChange(normalizedValue);
  };

  return (
    <div className="w-full">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <DollarSign className="h-4 w-4 text-[#d4af37]" />
        </div>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draftValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full bg-white border ${error ? 'border-red-500' : 'border-slate-200'} rounded-2xl py-4 pl-12 pr-5 text-slate-900 placeholder-slate-300 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all font-mono text-lg font-bold`}
          placeholder="10000"
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-500 flex items-center">
          <Info className="w-3 h-3 mr-1" /> {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Мин: ${min?.toLocaleString()} • Макс: ${max ? (max / 1000000) + 'M' : ''}</p>
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
    <div className="w-full">
      <div className="flex justify-between items-end mb-4">
        <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</label>
            {subtitle && <p className="text-xs text-[#d4af37] mt-1 font-medium">{subtitle}</p>}
        </div>
        <span className="text-lg font-bold font-serif text-slate-900">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2"
      />
      <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
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
    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-[#d4af37]/20 shadow-sm transition-all">
      <span className="text-sm font-bold text-slate-900">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2 focus:ring-offset-slate-50 ${
          checked ? 'bg-[#d4af37]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform`}
        />
      </button>
    </div>
  );
};