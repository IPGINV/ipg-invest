import React from 'react';
import { motion } from 'motion/react';
import { Building2, Globe, MapPin } from 'lucide-react';
import { locales } from '../locales';

interface CompanyPageProps {
  lang: 'en' | 'ru';
}

export function CompanyPage({ lang }: CompanyPageProps) {
  const t = locales[lang];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="luxury-card p-8 md:p-12 overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">{t.company}</h2>
            <p className="text-stone-500 text-sm mt-1">Imperial Pure Gold</p>
          </div>
        </div>
        <div className="space-y-6 text-stone-600 leading-relaxed">
          {lang === 'ru' ? (
            <>
              <p>
                Imperial Pure Gold — инвестиционная платформа с фокусом на золото и цифровые активы. Мы предоставляем институциональный уровень доступа к защищённым инвестициям с гарантированной ликвидностью.
              </p>
              <p>
                Наша миссия — сделать золото доступным инструментом диверсификации для частных инвесторов через прозрачные циклы доходности и современные технологии.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <a href="https://ipg-invest.ae" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#d4af37] hover:underline">
                  <Globe size={18} />
                  {t.companySite}
                </a>
                <p className="flex items-center gap-2 text-sm">
                  <MapPin size={18} className="text-stone-400" />
                  Dubai, UAE
                </p>
              </div>
            </>
          ) : (
            <>
              <p>
                Imperial Pure Gold is an investment platform focused on gold and digital assets. We provide institutional-grade access to secured investments with guaranteed liquidity.
              </p>
              <p>
                Our mission is to make gold an accessible diversification tool for private investors through transparent yield cycles and modern technology.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <a href="https://ipg-invest.ae" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#d4af37] hover:underline">
                  <Globe size={18} />
                  {t.companySite}
                </a>
                <p className="flex items-center gap-2 text-sm">
                  <MapPin size={18} className="text-stone-400" />
                  Dubai, UAE
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
