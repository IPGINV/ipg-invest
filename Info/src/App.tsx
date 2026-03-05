import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CompanyView from './components/CompanyView';
import ProjectView from './components/ProjectView';
import { TEXTS } from './constants';
import { Language, ViewState } from './types';
import { motion, AnimatePresence } from 'motion/react';

type AppProps = {
  apiBase?: string;
};

function App({ apiBase }: AppProps) {
  const [lang, setLang] = useState<Language>(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('lang');
    if (!value) return 'RU';
    return value.toUpperCase() === 'EN' ? 'EN' : 'RU';
  });
  
  const [view, setView] = useState<ViewState>(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('view');
    return value === 'project' ? 'project' : 'company';
  });

  const t = TEXTS[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('lang', lang);
    params.set('view', view);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [lang, view]);

  useEffect(() => {
    if (!apiBase) return;
    fetch(`${apiBase}/health`).catch(() => {});
  }, [apiBase]);

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans flex flex-col selection:bg-[#d4af37] selection:text-black ${view === 'company' ? 'bg-[#0a0a0a] text-white' : 'bg-[#fdfdfd] text-[#1a1a1a]'}`}>
      <Header 
        t={t} 
        lang={lang} 
        setLang={setLang}
        setView={setView}
        currentView={view}
      />
      
      <main className="flex-grow pt-[100px] pb-12 w-full relative z-0">
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#d4af37] blur-[150px] rounded-full transition-opacity duration-700 ${view === 'company' ? 'opacity-[0.08]' : 'opacity-[0.05]'}`} />
          <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#d4af37] blur-[150px] rounded-full transition-opacity duration-700 ${view === 'company' ? 'opacity-[0.08]' : 'opacity-[0.05]'}`} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view + lang}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'company' ? (
              <CompanyView t={t} lang={lang} />
            ) : (
              <ProjectView t={t} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer t={t} />
    </div>
  );
}

export default App;
