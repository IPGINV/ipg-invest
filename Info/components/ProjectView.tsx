import React, { useState } from 'react';
import { Send, Wallet, ArrowRight, Layers, Globe, Shield } from 'lucide-react';
import { Translation } from '../types';

interface ProjectViewProps {
  t: Translation;
}

const ProjectView: React.FC<ProjectViewProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'token'>('project');

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 animate-fade-in min-h-[60vh]">
      
      {/* Title */}
      <div className="text-center mb-12">
         <h1 className="text-3xl md:text-5xl font-playfair font-black text-white leading-tight uppercase mb-4">
          {t.projectTitle}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-16">
        <div className="inline-flex p-1 bg-white/5 rounded-full border border-white/10">
          <button 
            onClick={() => setActiveTab('project')}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'project' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-white/60 hover:text-white'}`}
          >
            {t.projectTabAbout}
          </button>
          <button 
            onClick={() => setActiveTab('token')}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'token' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-white/60 hover:text-white'}`}
          >
            {t.projectTabToken}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        
        {/* Project Tab Content */}
        {activeTab === 'project' && (
          <div className="grid md:grid-cols-2 gap-12 items-center animate-fade-in">
             <div className="space-y-8 order-2 md:order-1">
                <p className="text-xl md:text-2xl font-light text-white leading-relaxed">
                   {t.projectDesc}
                </p>
                <div className="h-[1px] w-20 bg-[#d4af37]"></div>
                <a 
                   href="https://t.me/GoldenShareClub" 
                   target="_blank" 
                   rel="noreferrer"
                   className="inline-flex items-center gap-3 px-8 py-4 border border-[#d4af37] text-[#d4af37] font-bold uppercase tracking-widest hover:bg-[#d4af37] hover:text-black transition-all group"
                >
                   {t.telegramBtn} <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
             </div>
             <div className="order-1 md:order-2 relative">
                <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <Globe size={300} strokeWidth={0.5} className="text-[#d4af37] animate-pulse" />
                   </div>
                   <img 
                     src="/images/project-hero.svg"
                     className="absolute inset-0 object-cover opacity-50 mix-blend-overlay"
                     alt="DMCC Ecosystem"
                   />
                   <div className="relative z-10 text-center space-y-2"></div>
                </div>
             </div>
          </div>
        )}

        {/* Token Tab Content */}
        {activeTab === 'token' && (
          <div className="animate-fade-in">
             <div className="bg-[#141417] border border-white/10 p-8 md:p-16 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 blur-[100px] rounded-full"></div>
                
                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                   <div className="space-y-8">
                      <div>
                        <span className="text-[#d4af37] font-bold text-sm tracking-widest mb-2 block">GHS</span>
                        <h2 className="text-4xl font-playfair text-white mb-6">{t.tokenTitle}</h2>
                        <p className="text-white/60 leading-relaxed text-lg">
                           {t.tokenDesc}
                        </p>
                      </div>
                      
                      <ul className="space-y-4">
                         {[t.tokenFeature1, t.tokenFeature2, t.tokenFeature3].map((feature, i) => (
                            <li key={i} className="flex items-center gap-4 text-white font-light border-b border-white/5 pb-4 last:border-0">
                               <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                                  {i === 0 ? <Shield size={14} /> : i === 1 ? <Wallet size={14} /> : <Layers size={14} />}
                               </div>
                               {feature}
                            </li>
                         ))}
                      </ul>

                      <div className="pt-8">
                         <a href="#" className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#d4af37] text-black font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#d4af37]/20">
                            {t.walletBtn} <ArrowRight size={16} />
                         </a>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-center">
                      <div className="relative w-64 h-64 md:w-80 md:h-80">
                         {/* Abstract Coin Representation */}
                         <div className="absolute inset-0 rounded-full border border-[#d4af37]/20 animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute inset-4 rounded-full border border-[#d4af37]/40 animate-[spin_15s_linear_infinite_reverse]"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full gold-gradient shadow-[0_0_50px_rgba(212,175,55,0.3)] flex items-center justify-center flex-col">
                               <span className="font-playfair font-black text-4xl text-black/80">GHS</span>
                               <span className="text-[8px] font-bold tracking-widest text-black/60 mt-1">TOKEN</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectView;