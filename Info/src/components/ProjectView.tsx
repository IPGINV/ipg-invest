import React, { useState } from 'react';
import { Send, Wallet, ArrowRight, Layers, Shield, Zap, TrendingUp, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Translation } from '../types';

interface ProjectViewProps {
  t: Translation;
}

const ProjectView: React.FC<ProjectViewProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'token'>('project');

  const getWalletUrl = () => {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    return isLocal ? 'http://localhost:5177' : 'https://wallet.ipg-invest.ae';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-4xl md:text-6xl font-playfair font-black text-black tracking-tight">
          {t.projectTitle}
        </h2>
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-black/5 rounded-xl border border-black/5 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('project')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all duration-500 ${
                activeTab === 'project'
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                  : 'text-black/40 hover:text-black'
              }`}
            >
              {t.projectTabAbout}
            </button>
            <button
              onClick={() => setActiveTab('token')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all duration-500 ${
                activeTab === 'token'
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                  : 'text-black/40 hover:text-black'
              }`}
            >
              {t.projectTabToken}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'project' ? (
          <motion.div
            key="project"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="luxury-card p-6 md:p-12 relative overflow-hidden group"
          >
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#d4af37] opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="w-10 h-1 bg-[#d4af37]" />
                  <p className="text-xl md:text-2xl font-playfair font-medium text-black leading-snug">
                    {t.projectDesc}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <FeatureItem icon={<Zap size={16}/>} text="Instant Liquidity" />
                  <FeatureItem icon={<TrendingUp size={16}/>} text="Market Yields" />
                  <FeatureItem icon={<Lock size={16}/>} text="Asset-Backed" />
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href="https://t.me/GoldenShareClub"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white font-bold uppercase text-[10px] rounded-xl hover:bg-[#d4af37] hover:text-black transition-all group/btn"
                  >
                    {t.telegramBtn} <Send size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://www.facebook.com/share/1Dox5wK2MT/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white font-bold uppercase text-[10px] rounded-xl hover:bg-[#d4af37] hover:text-black transition-all group/btn"
                  >
                    {t.facebookCommunityBtn} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="relative">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <img 
                    src="/images/project/golden-sheare.png" 
                    alt="Dubai Strategy" 
                    className="w-full h-auto rounded-[2rem] shadow-2xl shadow-black/10 border border-black/5"
                  />
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white p-2 rounded-2xl shadow-xl border border-black/5 rotate-12">
                     <img 
                       src="/images/project/token.png" 
                       alt="Token Detail" 
                       className="w-full h-full object-cover rounded-xl"
                     />
                  </div>
                </motion.div>
                <div className="absolute inset-0 bg-[#d4af37] opacity-5 blur-[60px] rounded-full -z-10" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="token"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="luxury-card p-6 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-10">
                <div className="text-center md:text-left">
                  <span className="text-[10px] font-black uppercase tracking-normal text-[#d4af37] mb-3 block">
                    GHS NATIVE ASSET
                  </span>
                  <h3 className="text-3xl md:text-4xl font-playfair font-black text-black mb-4 leading-tight">
                    {t.tokenTitle}
                  </h3>
                  <p className="text-black/60 text-base font-light leading-relaxed">
                    {t.tokenDesc}
                  </p>
                </div>

                <div className="space-y-3">
                  {[t.tokenFeature1, t.tokenFeature2, t.tokenFeature3].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-black/5 rounded-xl border border-black/5 group hover:border-[#d4af37]/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#d4af37] shadow-sm group-hover:scale-110 transition-transform">
                        {i === 0 ? <Shield size={18} /> : i === 1 ? <Wallet size={18} /> : <Layers size={18} />}
                      </div>
                      <span className="text-black font-bold text-xs uppercase">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-2 flex justify-center md:justify-start">
                  <a
                    href={getWalletUrl()}
                    className="inline-flex items-center gap-3 px-8 py-4 gold-gradient text-black font-black uppercase text-[10px] rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[#d4af37]/20 group"
                  >
                    {t.walletBtn} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-center relative">
                <div className="absolute inset-0 gold-gradient opacity-5 blur-[100px] rounded-full" />
                <div className="relative w-56 h-56 md:w-72 md:h-72">
                  <div className="absolute inset-0 rounded-full border border-[#d4af37]/10 animate-[spin_15s_linear_infinite]" />
                  <div className="absolute inset-6 rounded-full border border-[#d4af37]/20 animate-[spin_10s_linear_infinite_reverse]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.03, 1],
                        rotate: [0, 3, -3, 0]
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-36 h-36 md:w-48 md:h-48 rounded-full gold-gradient shadow-2xl shadow-[#d4af37]/30 flex items-center justify-center flex-col border-2 border-white/30 overflow-hidden"
                    >
                      <img 
                        src="https://picsum.photos/seed/ghs-token/400/400" 
                        alt="Token Visual" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                        referrerPolicy="no-referrer"
                      />
                      <span className="relative z-10 font-playfair font-black text-3xl md:text-4xl text-black/90">GHS</span>
                      <span className="relative z-10 text-[9px] font-black tracking-normal text-black/60 mt-1">TOKEN</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-3 text-black/40 group">
    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-all">
      {icon}
    </div>
    <span className="text-[9px] font-bold uppercase">{text}</span>
  </div>
);

export default ProjectView;
