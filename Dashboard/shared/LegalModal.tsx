import React from 'react';
import { X } from 'lucide-react';
import { getLegalContent, type LegalType, type LegalLang } from './legalContent';

interface LegalModalProps {
  type: LegalType;
  lang: LegalLang;
  onClose: () => void;
  closeLabel?: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, lang, onClose, closeLabel = 'Close' }) => {
  const { title, content } = getLegalContent(lang, type);

  return (
    <div className="fixed inset-0 z-[280] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-[#0c0c0e]/90 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl flex flex-col bg-[#141417]/98 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 flex-shrink-0">
          <h3 className="text-lg md:text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg transition-colors" aria-label="Close">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 text-sm md:text-base text-white/80 leading-relaxed whitespace-pre-line">
          {content}
        </div>
        <div className="p-4 md:p-6 border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-colors">
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
