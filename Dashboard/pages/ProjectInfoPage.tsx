import React from 'react';
import { motion } from 'motion/react';
import { Info, TrendingUp, Shield } from 'lucide-react';
import { locales } from '../locales';

interface ProjectInfoPageProps {
  lang: 'en' | 'ru';
}

export function ProjectInfoPage({ lang }: ProjectInfoPageProps) {
  const t = locales[lang];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="luxury-card p-8 md:p-12 overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Info size={32} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">{t.projectInfo}</h2>
            <p className="text-stone-500 text-sm mt-1">IPG Investment Ecosystem</p>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-2 flex items-center gap-2">
              <TrendingUp size={20} />
              {lang === 'ru' ? 'Циклы доходности' : 'Yield Cycles'}
            </h3>
            <p className="text-stone-600 leading-relaxed">
              {lang === 'ru'
                ? 'Инвестиции работают по цикличной модели: средства вносятся до определённой даты, после чего начисляется фиксированная доходность 6.8% за цикл. Циклы привязаны к LBMA Gold Benchmark и открываются по календарю.'
                : 'Investments operate on a cyclical model: funds are deposited before a specific date, after which a fixed 6.8% yield per cycle is accrued. Cycles are linked to the LBMA Gold Benchmark and open according to the calendar.'}
            </p>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-2 flex items-center gap-2">
              <Shield size={20} />
              {lang === 'ru' ? 'Безопасность' : 'Security'}
            </h3>
            <p className="text-stone-600 leading-relaxed">
              {lang === 'ru'
                ? 'Все операции защищены KYC-верификацией. Средства учитываются в токенах IPG с привязкой к физическому золоту. Комплаенс соответствует требованиям регулирования ОАЭ.'
                : 'All operations are protected by KYC verification. Funds are accounted in IPG tokens linked to physical gold. Compliance meets UAE regulatory requirements.'}
            </p>
          </div>
          <div className="pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400">
              {lang === 'ru'
                ? 'Инвестирование сопряжено с рисками. Перед принятием решений ознакомьтесь с раскрытием рисков и условиями использования.'
                : 'Investing involves risks. Please review the risk disclosure and terms of service before making decisions.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
