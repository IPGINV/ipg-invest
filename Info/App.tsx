import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CompanyView from './components/CompanyView';
import ProjectView from './components/ProjectView';
import { TEXTS } from './constants';
import { Language, ViewState } from './types';

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
    if (!apiBase) return;
    fetch(`${apiBase}/health`).catch(() => {});
  }, [apiBase]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
      <Header 
        t={t} 
        lang={lang} 
        setLang={setLang}
        setView={setView}
        currentView={view}
      />
      
      <main className="flex-grow pt-[120px] pb-20 w-full relative z-0">
        <div className="absolute top-[120px] left-0 w-full h-[500px] bg-gradient-to-b from-[#141417] to-transparent -z-10 pointer-events-none"></div>
        
        {view === 'company' ? (
          <CompanyView t={t} lang={lang} />
        ) : (
          <ProjectView t={t} />
        )}
      </main>

      <Footer t={t} />
    </div>
  );
}

export default App;