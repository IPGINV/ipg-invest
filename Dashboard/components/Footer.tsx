
import React from 'react';
import { locales } from '../locales';

interface FooterProps {
  lang: 'en' | 'ru';
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = locales[lang];
  return (
    <footer className="relative z-10 py-4 px-4 md:px-7 bg-[#141417]/90 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-0 w-full relative">
          <div className="absolute left-1/2 top-1 bottom-1 w-[1px] bg-white/10 -translate-x-1/2"></div>
          <div className="space-y-2 flex flex-col items-center lg:items-start pr-2 md:pr-6 text-center lg:text-left">
            <h4 className="text-[7px] md:text-[8px] font-black text-[#d4af37] uppercase tracking-[0.3em] pb-1 border-b border-[#d4af37]/15 w-full">
              {t.footerCompliance}
            </h4>
            <ul className="space-y-1.5 text-[6px] md:text-[8px] font-bold uppercase tracking-widest text-white/50">
              <li className="flex flex-col lg:flex-row items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <i className="fa-solid fa-shield-halved text-[#d4af37] text-[10px]"></i> <span>DMCC Registered</span>
              </li>
              <li className="flex flex-col lg:flex-row items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <i className="fa-solid fa-award text-[#d4af37] text-[10px]"></i> <span>LBMA Standard</span>
              </li>
              <li className="flex flex-col lg:flex-row items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <i className="fa-solid fa-lock text-[#d4af37] text-[10px]"></i> <span>Multi-Sig Security</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2 flex flex-col items-center lg:items-start pl-2 md:pl-6 text-center lg:text-left">
            <h4 className="text-[7px] md:text-[8px] font-black text-[#d4af37] uppercase tracking-[0.3em] pb-1 border-b border-[#d4af37]/15 w-full">
              {t.footerNetwork}
            </h4>
            <ul className="space-y-1.5 text-[6px] md:text-[8px] font-bold uppercase tracking-widest text-white/50">
              <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <a href="mailto:info@ipg-invest.ae" className="flex items-center gap-1">
                  <i className="fa-solid fa-envelope text-[10px]"></i> <span className="break-all">INFO@IPG-INVEST.AE</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 w-full">
          <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-[0.2em] text-white/20">
            © {new Date().getFullYear()} Imperial Pure Gold Trading LLC. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-[6px] md:text-[7px] font-bold uppercase tracking-[0.2em] text-white/20">
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
