import React from 'react';
import { Footer } from '../../shared/Footer';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface FooterProps {
  lang: Language;
  onLegalClick?: (type: 'privacy' | 'terms' | 'risks') => void;
}

const FooterWrapper: React.FC<FooterProps> = ({ lang, onLegalClick }) => {
  const t = TRANSLATIONS[lang];
  return <Footer t={t} onLegalClick={onLegalClick} />;
};

export default FooterWrapper;
