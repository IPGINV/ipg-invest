import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { locales } from '../locales';

interface LoadingScreenV2Props {
  onComplete: () => void;
  lang?: 'en' | 'ru';
  /** Minimum display time in ms. Default 1500 for auth loading. */
  minDuration?: number;
}

const LoadingScreenV2: React.FC<LoadingScreenV2Props> = ({
  onComplete,
  lang = 'en',
  minDuration = 1500
}) => {
  const t = locales[lang];

  React.useEffect(() => {
    const timer = setTimeout(onComplete, minDuration);
    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  return (
    <div className="fixed inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center z-[100]">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-[#d4af37]/30 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-[#d4af37] animate-spin" style={{ animationDuration: '10s' }} />
          <ShieldCheck size={40} className="text-[#d4af37]" />
        </div>
      </div>

      <div className="text-center">
        <h1 className="font-serif text-2xl text-white tracking-wider mb-2">IMPERIAL PURE GOLD</h1>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <p className="text-[#d4af37] text-xs uppercase tracking-[0.2em]">{t.securityProtocol}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreenV2;
