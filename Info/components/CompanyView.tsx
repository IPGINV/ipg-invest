import React from 'react';
import { FileText, ExternalLink, Download, ArrowRight } from 'lucide-react';
import { Language, Translation } from '../types';
import { TEAM } from '../constants';

interface CompanyViewProps {
  t: Translation;
  lang: Language;
}

const CompanyView: React.FC<CompanyViewProps> = ({ t, lang }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 animate-fade-in relative">
      <div className="absolute inset-0 -z-10">
        <div
          className="w-full h-full rounded-[2.5rem]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1745750434535-5943ef2fd31a?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/80 rounded-[2.5rem]"></div>
      </div>
      
      {/* Header Section */}
      <div className="mb-16 text-center">
        <span className="text-[#d4af37] font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-4 block">
          {t.companyTitle}
        </span>
        <h1 className="text-3xl md:text-5xl font-playfair font-black text-white leading-tight uppercase">
          {t.companySubtitle}
        </h1>
      </div>

      {/* Description Block */}
      <div className="grid md:grid-cols-12 gap-12 mb-20 items-start">
        <div className="md:col-span-4 relative group">
          <div className="aspect-[3/4] rounded-sm overflow-hidden border border-white/10 relative">
             <img 
               src="/images/company-hero.svg"
               alt="Imperial Pure Gold"
               className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-700"
             />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#d4af37]/30 rounded-2xl hidden md:block z-0"></div>
        </div>
        <div className="md:col-span-8 space-y-8">
           <h2 className="text-2xl font-playfair text-white border-l-2 border-[#d4af37] pl-6">
             {t.companyDescTitle}
           </h2>
           <div className="text-white/70 font-light leading-relaxed text-lg space-y-6">
             <p>{t.companyDescText1}</p>
             <p>{t.companyDescText2}</p>
           </div>
           
           {/* External Link */}
           <a 
             href="https://imperialpuregold.ae" 
             target="_blank" 
             rel="noreferrer"
             className="inline-flex items-center gap-3 text-[#d4af37] font-bold uppercase tracking-widest text-xs hover:text-white transition-colors mt-4"
           >
             {t.externalLinkText} <ExternalLink size={14} />
           </a>
        </div>
      </div>

      {/* License Section */}
      <div className="bg-[#141417]/50 border border-white/5 p-8 md:p-12 mb-20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={120} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
               <h3 className="text-xl font-playfair text-white mb-2">{t.licenseTitle}</h3>
              <p className="text-white/40 text-sm font-mono tracking-widest">DMCC-944655</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/licenses/ipg-license.pdf"
                download
                className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                <Download size={14} /> {t.licenseDownload}
              </a>
            </div>
         </div>
      </div>

      {/* Leadership Section */}
      <div>
        <h3 className="text-center text-[#d4af37] font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-12">
          {t.leadershipTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {TEAM[lang].map((member, idx) => (
            <div key={idx} className="group relative">
               <div className="aspect-square overflow-hidden mb-6 border-b border-[#d4af37]/20">
                 <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
               </div>
               <h4 className="text-white font-playfair text-lg">{member.name}</h4>
               <p className="text-[#d4af37] text-xs uppercase tracking-widest mt-2">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CompanyView;