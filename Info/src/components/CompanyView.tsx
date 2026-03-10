import React from 'react';
import { Building2, Globe, MapPin, FileText, Download, ShieldCheck, Award, Lock, Phone, Mail, MessageCircle, Send, Facebook } from 'lucide-react';
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
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4 relative"
      >
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10">
           <img 
             src="https://picsum.photos/seed/gold-mine/1200/400?blur=10" 
             alt="Background" 
             className="w-full h-full object-cover rounded-[3rem]"
             referrerPolicy="no-referrer"
           />
        </div>
        <h2 className="text-4xl md:text-7xl font-playfair font-black text-white tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          {t.companyTitle}
        </h2>
        <p className="text-[#d4af37] font-bold text-[10px] md:text-[12px] uppercase tracking-normal max-w-2xl mx-auto">
          {t.companySubtitle}
        </p>
        <div className="h-px w-16 bg-[#d4af37] mx-auto mt-4" />
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
          <Building2 size={240} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white mb-6">
            {t.companyDescTitle}
          </h3>
          <div className="text-white/60 text-base md:text-lg font-light leading-relaxed space-y-4 max-w-3xl">
            <p>{t.companyDescText1}</p>
            <p>{t.companyDescText2}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/5 w-full">
            <div className="flex items-center gap-3 text-white/40 font-medium">
              <MapPin size={18} className="text-[#d4af37]" />
              <span className="text-sm">Dubai, UAE</span>
            </div>
            <a
              href="https://imperialpuregold.ae"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-[#d4af37] font-bold uppercase text-[10px] hover:text-white transition-colors"
            >
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

      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-white/5 backdrop-blur-xl border border-[#d4af37]/20 p-8 md:p-10 rounded-[2rem] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
          <FileText size={120} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-playfair font-bold text-white mb-1">{t.licenseTitle}</h3>
            <p className="text-[#d4af37] text-[10px] font-bold uppercase">DMCC License: 944655</p>
          </div>
          <a
            href="https://imperialpuregold.ae/license.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-8 py-4 gold-gradient text-black font-black text-[10px] uppercase rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[#d4af37]/20"
          >
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
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-[1.5rem] group text-center"
            >
              <div className="aspect-square overflow-hidden rounded-[1rem] mb-6 border border-white/5 shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="text-white font-playfair font-bold text-lg mb-1">{member.name}</h4>
              <p className="text-[#d4af37] text-[9px] font-black uppercase">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-playfair font-bold text-white">{t.contactsTitle}</h3>
          <div className="h-0.5 w-10 bg-[#d4af37] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-8 flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-3 text-[#d4af37]">
              <MapPin size={32} />
              <h4 className="text-lg font-bold uppercase tracking-widest">{t.addressTitle}</h4>
            </div>
            <div className="space-y-6 w-full">
              <div className="space-y-2">
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">English</p>
                <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto">{t.addressEn}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">العربية</p>
                <p className="text-white/80 text-sm leading-relaxed font-arabic max-w-xs mx-auto" dir="rtl">{t.addressAr}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-8 flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-3 text-[#d4af37]">
              <Phone size={32} />
              <h4 className="text-lg font-bold uppercase tracking-widest">{t.footerNetwork}</h4>
            </div>
            <div className="space-y-4 w-full">
              <div className="flex flex-col items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#d4af37]/30 transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#d4af37]" />
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{t.phoneTitle}</span>
                </div>
                <a href="tel:+447587413404" className="text-white font-bold text-base hover:text-[#d4af37] transition-colors tracking-tight">+44 75 8741 3404</a>
              </div>
              
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#d4af37]/30 transition-all space-y-3 flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-base">Виктория</span>
                  <span className="text-[9px] text-[#d4af37] uppercase font-black tracking-widest mt-1">{t.marketingManager}</span>
                </div>
                <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/80 font-medium text-sm hover:text-[#d4af37] transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <MessageCircle size={14} className="text-[#d4af37]" />
                  <span>+971 52 965 7370 (Менеджер по маркетингу)</span>
                </a>
              </div>

              <div className="flex flex-col items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#d4af37]/30 transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#d4af37]" />
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">E-mail</span>
                </div>
                <a href="mailto:info@imperialpuregold.ae" className="text-white font-bold text-sm hover:text-[#d4af37] transition-colors">info@imperialpuregold.ae</a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-10 flex flex-col items-center"
        >
          <div className="flex flex-col items-center gap-3 text-[#d4af37]">
            <Building2 size={32} />
            <h4 className="w-full text-center text-lg font-bold uppercase tracking-widest">{t.projectManagersTitle}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6 flex flex-col items-center text-center group hover:border-[#d4af37]/20 transition-all">
              <div className="space-y-1">
                <h5 className="text-white font-playfair font-bold text-xl">Григорий</h5>
                <div className="h-0.5 w-6 bg-[#d4af37] mx-auto opacity-50" />
              </div>
              <div className="flex flex-col gap-3 w-full">
                <a href="https://t.me/IPG_Gregory" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-xl text-white/70 hover:text-white hover:bg-[#d4af37]/10 transition-all border border-white/5">
                  <Send size={14} className="text-[#d4af37]" />
                  <span className="text-xs font-bold uppercase tracking-wider">@IPG_Gregory</span>
                </a>
                <a href="https://wa.me/447455904945" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-xl text-white/70 hover:text-white hover:bg-[#d4af37]/10 transition-all border border-white/5">
                  <MessageCircle size={14} className="text-[#d4af37]" />
                  <span className="text-xs font-bold uppercase tracking-wider">+44 7455 904945</span>
                </a>
              </div>
            </div>

            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 space-y-6 flex flex-col items-center text-center group hover:border-[#d4af37]/20 transition-all">
              <div className="space-y-1">
                <h5 className="text-white font-playfair font-bold text-xl">Марк</h5>
                <div className="h-0.5 w-6 bg-[#d4af37] mx-auto opacity-50" />
              </div>
              <div className="flex flex-col gap-3 w-full">
                <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-xl text-white/70 hover:text-white hover:bg-[#d4af37]/10 transition-all border border-white/5">
                  <Send size={14} className="text-[#d4af37]" />
                  <span className="text-xs font-bold uppercase tracking-wider">@IPG_Mark</span>
                </a>
                <a href="https://wa.me/447776177435" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-xl text-white/70 hover:text-white hover:bg-[#d4af37]/10 transition-all border border-white/5">
                  <MessageCircle size={14} className="text-[#d4af37]" />
                  <span className="text-xs font-bold uppercase tracking-wider">+44 77 7617 7435</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] space-y-10 flex flex-col items-center"
        >
          <div className="flex flex-col items-center gap-3 text-[#d4af37]">
            <Globe size={32} />
            <h4 className="text-lg font-bold uppercase tracking-widest">{t.resourcesTitle}</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <ResourceLink icon={<Globe size={18} />} title={t.mainSite} link="https://imperialpuregold.ae" label="imperialpuregold.ae" />
            <ResourceLink icon={<Building2 size={18} />} title={t.investProject} link="https://ipg-invest.ae" label="ipg-invest.ae" />
            <ResourceLink icon={<Facebook size={18} />} title="Facebook" link="https://www.facebook.com/share/1Dox5wK2MT/" label="Imperial Pure Gold | Dubai" />
            <ResourceLink icon={<Send size={18} />} title={t.telegramChannel} link="https://t.me/GoldenShareClub" label="@GoldenShareClub" />
          </div>
        </motion.div>
      </section>
    </div>
  );
};

const ResourceLink = ({ icon, title, link, label }: { icon: React.ReactNode, title: string, link: string, label: string }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noreferrer"
    className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-[#d4af37]/40 transition-all group flex flex-col items-center text-center"
  >
    <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-2">{title}</span>
    <span className="text-white font-bold text-xs group-hover:text-[#d4af37] transition-colors">{label}</span>
  </a>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-[1.5rem] hover:border-[#d4af37]/30 transition-all group text-center flex flex-col items-center"
  >
    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-white font-bold text-base mb-2 uppercase">{title}</h4>
    <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
  </motion.div>
);

export default CompanyView;
