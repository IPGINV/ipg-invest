import React from 'react';
import { Building2, Globe, MapPin, FileText, Download, ShieldCheck, Award, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, Translation } from '../types';
import { TEAM } from '../constants';

interface CompanyViewProps {
  t: Translation;
  lang: Language;
}

const CompanyView: React.FC<CompanyViewProps> = ({ t, lang }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-16">
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4 relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10">
          <img src="https://picsum.photos/seed/gold-mine/1200/400?blur=10" alt="Background" className="w-full h-full object-cover rounded-[3rem]" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-4xl md:text-7xl font-playfair font-black text-white tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">{t.companyTitle}</h2>
        <p className="text-[#d4af37] font-bold text-[10px] md:text-[12px] uppercase tracking-normal max-w-2xl mx-auto">{t.companySubtitle}</p>
        <div className="h-px w-16 bg-[#d4af37] mx-auto mt-4" />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
          <Building2 size={240} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white mb-6">{t.companyDescTitle}</h3>
          <div className="text-white/60 text-base md:text-lg font-light leading-relaxed space-y-4 max-w-3xl">
            <p>{t.companyDescText1}</p>
            <p>{t.companyDescText2}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/5 w-full">
            <div className="flex items-center gap-3 text-white/40 font-medium">
              <MapPin size={18} className="text-[#d4af37]" />
              <span className="text-sm">Dubai, UAE</span>
            </div>
            <a href="https://imperialpuregold.ae" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#d4af37] font-bold uppercase text-[10px] hover:text-white transition-colors">
              {t.externalLinkText} <Globe size={14} />
            </a>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard icon={<ShieldCheck size={20} />} title="Compliance" desc="Full adherence to DMCC and international gold trade regulations." />
        <FeatureCard icon={<Award size={20} />} title="Quality" desc="Only LBMA-standard physical gold bars from certified refineries." />
        <FeatureCard icon={<Lock size={20} />} title="Security" desc="Multi-signature asset management and institutional-grade custody." />
      </section>

      <motion.section initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 p-8 md:p-10 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
          <FileText size={120} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-playfair font-bold text-white mb-1">{t.licenseTitle}</h3>
            <p className="text-[#d4af37] text-[10px] font-bold uppercase">DMCC License: 944655</p>
          </div>
          <a href="/licenses/ipg-license.pdf" download className="flex items-center gap-3 px-8 py-4 gold-gradient text-black font-black text-[10px] uppercase rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[#d4af37]/20">
            <Download size={16} /> {t.licenseDownload}
          </a>
        </div>
      </motion.section>

      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-playfair font-bold text-white">{t.leadershipTitle}</h3>
          <div className="h-0.5 w-10 bg-[#d4af37] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEAM[lang].map((member, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.2 }} viewport={{ once: true }} className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-[1.5rem] group text-center">
              <div className="aspect-square overflow-hidden rounded-[1rem] mb-6 border border-white/5 shadow-sm">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" referrerPolicy="no-referrer" />
              </div>
              <h4 className="text-white font-playfair font-bold text-lg mb-1">{member.name}</h4>
              <p className="text-[#d4af37] text-[9px] font-black uppercase">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-[1.5rem] hover:border-[#d4af37]/30 transition-all group text-center flex flex-col items-center">
    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h4 className="text-white font-bold text-base mb-2 uppercase">{title}</h4>
    <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
  </motion.div>
);

export default CompanyView;
