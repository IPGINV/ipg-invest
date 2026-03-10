import React from 'react';
import { Mail, Send, Gem, Phone, Facebook } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'risks';

export interface FooterTranslations {
  footerCompliance: string;
  footerPrivacy: string;
  footerTerms: string;
  footerRisk: string;
  footerNetwork: string;
  footerSupport: string;
  rights: string;
}

interface FooterProps {
  t: FooterTranslations;
  onLegalClick?: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ t, onLegalClick }) => {
  const legalItems: Array<{ label: string; type: LegalModalType }> = [
    { label: t.footerPrivacy, type: 'privacy' },
    { label: t.footerTerms, type: 'terms' },
    { label: t.footerRisk, type: 'risks' },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white pt-8 pb-6 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
          <div className="space-y-6 lg:pr-12 lg:border-r lg:border-white/10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] border-b border-[#d4af37]/20 pb-2 inline-block">
              {t.footerCompliance}
            </h4>
            <div className="flex flex-col gap-4">
              {legalItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onLegalClick?.(item.type)}
                  className="text-left text-white/40 hover:text-[#d4af37] text-[11px] transition-all font-bold uppercase tracking-tight hover:translate-x-1 inline-block bg-transparent border-none cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:pl-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] border-b border-[#d4af37]/20 pb-2 inline-block">
              {t.footerNetwork}
            </h4>
            <div className="flex flex-col items-start text-left gap-4 sm:hidden">
              <a href="mailto:info@ipg-invest.ae" className="flex items-center justify-start gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                <Mail size={14} className="text-[#d4af37]/50 flex-shrink-0" /> info@ipg-invest.ae
              </a>
              <a href="mailto:info@imperialpuregold.ae" className="flex items-center justify-start gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                <Mail size={14} className="text-[#d4af37]/50 flex-shrink-0" /> info@imperialpuregold.ae
              </a>
              <a href="tel:+447587413404" className="flex items-center justify-start gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                <Phone size={14} className="text-[#d4af37]/50 flex-shrink-0" /> +44 75 8741 3404
              </a>
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-start justify-start gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                <Send size={14} className="text-[#d4af37]/50 mt-0.5 flex-shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span>Telegram</span>
                  <span className="text-[9px] opacity-50 normal-case tracking-normal">({t.footerSupport})</span>
                </span>
              </a>
              <a href="#" className="flex items-start justify-start gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                <Facebook size={14} className="text-[#d4af37]/50 mt-0.5 flex-shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span>Facebook</span>
                  <span className="text-[9px] opacity-50 normal-case tracking-normal">(Imperial Pure Gold)</span>
                </span>
              </a>
            </div>
            <div className="hidden sm:grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-4">
                <a href="mailto:info@ipg-invest.ae" className="flex items-center gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                  <Mail size={14} className="text-[#d4af37]/50" /> info@ipg-invest.ae
                </a>
                <a href="mailto:info@imperialpuregold.ae" className="flex items-center gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight">
                  <Mail size={14} className="text-[#d4af37]/50" /> info@imperialpuregold.ae
                </a>
              </div>
              <div className="space-y-4 flex flex-col items-end text-right sm:items-start sm:text-left">
                <a href="tel:+447587413404" className="flex items-center justify-end gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight sm:justify-start">
                  <Phone size={14} className="text-[#d4af37]/50" /> +44 75 8741 3404
                </a>
                <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-start justify-end gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight sm:justify-start">
                  <Send size={14} className="text-[#d4af37]/50 mt-0.5 flex-shrink-0" />
                  <span className="flex flex-col items-end leading-tight sm:items-start">
                    <span>Telegram</span>
                    <span className="text-[9px] opacity-50 normal-case tracking-normal">({t.footerSupport})</span>
                  </span>
                </a>
                <a href="#" className="flex items-start justify-end gap-3 text-white/40 hover:text-[#d4af37] text-[11px] transition-colors font-bold uppercase tracking-tight sm:justify-start">
                  <Facebook size={14} className="text-[#d4af37]/50 mt-0.5 flex-shrink-0" />
                  <span className="flex flex-col items-end leading-tight sm:items-start">
                    <span>Facebook</span>
                    <span className="text-[9px] opacity-50 normal-case tracking-normal">(Imperial Pure Gold)</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 gold-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Gem className="text-black" size={16} />
            </div>
            <span className="font-playfair font-black text-[11px] uppercase tracking-tight text-white/60 group-hover:text-white transition-colors">Imperial Pure Gold</span>
          </div>
          <p className="text-[10px] text-white/20 font-bold tracking-normal uppercase text-center md:text-right">
            © 2026 IPG DMCC. {t.rights.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
};
