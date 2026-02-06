import React from 'react';
import { ShieldCheck, Award, Lock, Mail, Send, MessageCircle } from 'lucide-react';
import { Translation } from '../types';

interface FooterProps {
  t: Translation;
}

const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="relative z-10 py-12 px-6 md:px-20 bg-[#141417]/90 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-2 gap-0 w-full relative">
          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-white/10 -translate-x-1/2"></div>
          
          {/* Left Column: Compliance */}
          <div className="space-y-6 flex flex-col items-center lg:items-start pr-4 md:pr-16 text-center lg:text-left">
            <h4 className="text-[10px] md:text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] pb-3 border-b border-[#d4af37]/15 w-full">
              {t.footerCompliance}
            </h4>
            <ul className="space-y-4 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
              <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                <ShieldCheck size={16} className="text-[#d4af37] group-hover:scale-110 transition-transform" /> 
                <span>DMCC Registered</span>
              </li>
              <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                <Award size={16} className="text-[#d4af37] group-hover:scale-110 transition-transform" /> 
                <span>LBMA Standard</span>
              </li>
              <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                <Lock size={16} className="text-[#d4af37] group-hover:scale-110 transition-transform" /> 
                <span>Multi-Sig Security</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Network */}
          <div className="space-y-6 flex flex-col items-center lg:items-start pl-4 md:pl-16 text-center lg:text-left">
            <h4 className="text-[10px] md:text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] pb-3 border-b border-[#d4af37]/15 w-full">
              {t.footerNetwork}
            </h4>
            <ul className="space-y-4 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <a href="mailto:info@ipg-invest.ae" className="flex items-center gap-3">
                  <Mail size={16} /> <span className="break-all">info@ipg-invest.ae</span>
                </a>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center gap-3">
                  <Send size={16} /> <span>Official Telegram</span>
                </a>
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
                <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-3">
                  <MessageCircle size={16} /> <span>{t.footerSupport}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 w-full">
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
            © 2026 Imperial Pure Gold Trading LLC. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
            <button className="hover:text-[#d4af37] transition-colors">{t.footerPrivacy}</button>
            <button className="hover:text-[#d4af37] transition-colors">{t.footerRisk}</button>
            <button className="hover:text-[#d4af37] transition-colors">{t.footerTerms}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;