import React from 'react';
import { Footer } from '../shared/Footer';
import { locales } from '../locales';

interface FooterV2Props {
  lang: 'en' | 'ru';
  onLegalClick?: (type: 'privacy' | 'terms' | 'risks') => void;
}

const FooterV2: React.FC<FooterV2Props> = ({ lang, onLegalClick }) => {
  const t = locales[lang];
  return <Footer t={t} onLegalClick={onLegalClick} />;
};

export default FooterV2;
