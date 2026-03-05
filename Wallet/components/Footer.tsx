import React from 'react';
import { ShieldCheck, Award, Lock, Mail, Send, MessageCircle, Gem } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface FooterProps {
  lang: Language;
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className="bg-[#0a0a0a] text-white pt-3 pb-1.5 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 gap-4 md:gap-8 mb-3">
          <div className="flex flex-col items-start">
            <h4 className="text-[7px] font-black uppercase tracking-widest text-[#d4af37] mb-1">{t.footerCompliance}</h4>
            <div className="flex flex-col gap-0.5 text-left">
              <a href="#" className="text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">{t.footerPrivacy}</a>
              <a href="#" className="text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">{t.footerTerms}</a>
              <a href="#" className="text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">{t.footerRisk}</a>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <h4 className="text-[7px] font-black uppercase tracking-widest text-[#d4af37] mb-1">{t.footerNetwork}</h4>
            <div className="flex flex-col gap-0.5 text-right">
              <a href="mailto:info@ipg-invest.ae" className="flex items-center justify-end gap-1 text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold break-all">
                <Mail size={8} /> info@ipg-invest.ae
              </a>
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">
                <Send size={8} /> Telegram
              </a>
              <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 text-white/30 hover:text-[#d4af37] text-[8px] transition-colors font-bold">
                <MessageCircle size={8} /> {t.footerSupport}
              </a>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 gold-gradient rounded flex items-center justify-center shadow-lg">
              <Gem className="text-black" size={8} />
            </div>
            <span className="font-playfair font-black text-[7px] uppercase tracking-tight text-white/40">Imperial Pure Gold</span>
          </div>
          <p className="text-[7px] text-white/20 font-medium tracking-wide">
            © {new Date().getFullYear()} IPG DMCC. {t.rights.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
