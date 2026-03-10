/** Shared legal documents for all IPG web apps */

export type LegalType = 'privacy' | 'terms' | 'risks';
export type LegalLang = 'RU' | 'EN' | 'ru' | 'en';

export const LEGAL_CONTENT: Record<'RU' | 'EN', Record<LegalType, { title: string; content: string }>> = {
  RU: {
    privacy: {
      title: 'Политика конфиденциальности',
      content: `Imperial Pure Gold DMCC обязуется защищать персональные данные пользователей в соответствии с применимым законодательством ОАЭ и международными стандартами.

Мы собираем только необходимую информацию для оказания услуг: контактные данные, данные для идентификации и финансовой верификации. Информация хранится на защищённых серверах и не передаётся третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.

Вы имеете право на доступ, исправление и удаление своих данных. Для запросов обращайтесь: info@ipg-invest.ae.

Обновлено: март 2026.`
    },
    terms: {
      title: 'Условия использования',
      content: `Используя платформу Imperial Pure Gold DMCC, вы соглашаетесь с настоящими условиями.

Услуги предоставляются лицензированной компанией в зоне DMCC (Дубай). Инвестиции в физическое золото несут рыночные риски. Прошлые результаты не гарантируют будущей доходности.

Минимальный возраст пользователя — 18 лет. Клиент несёт ответственность за достоверность предоставленной информации и соблюдение законодательства своей юрисдикции.

Все споры регулируются законодательством ОАЭ. Imperial Pure Gold DMCC оставляет за собой право изменять условия с уведомлением пользователей.

Обновлено: март 2026.`
    },
    risks: {
      title: 'Предупреждение о рисках',
      content: `Инвестиции в драгоценные металлы сопряжены с рисками. Стоимость золота может колебаться под воздействием рыночных, геополитических и макроэкономических факторов.

Модель Fixed Price уменьшает, но не устраняет волатильность. Доходность не гарантирована. Цифровые активы (токены) являются дополнительным инструментом и могут быть подвержены технологическим рискам.

Рекомендуется инвестировать только средства, потерю которых вы готовы принять. Перед принятием решений проконсультируйтесь с финансовым специалистом.

Imperial Pure Gold DMCC не даёт индивидуальных инвестиционных рекомендаций. Обновлено: март 2026.`
    }
  },
  EN: {
    privacy: {
      title: 'Privacy Policy',
      content: `Imperial Pure Gold DMCC is committed to protecting your personal data in accordance with applicable UAE law and international standards.

We collect only the information necessary to provide our services: contact details, identity and financial verification data. Information is stored on secured servers and is not shared with third parties without your consent, except as required by law.

You have the right to access, correct and delete your data. For requests, contact: info@ipg-invest.ae.

Last updated: March 2026.`
    },
    terms: {
      title: 'Terms of Use',
      content: `By using the Imperial Pure Gold DMCC platform, you agree to these terms.

Services are provided by a licensed company in the DMCC zone (Dubai). Investments in physical gold carry market risks. Past performance does not guarantee future returns.

Minimum user age is 18. The client is responsible for the accuracy of information provided and compliance with the laws of their jurisdiction.

All disputes are governed by UAE law. Imperial Pure Gold DMCC reserves the right to amend terms with notice to users.

Last updated: March 2026.`
    },
    risks: {
      title: 'Risk Warning',
      content: `Investments in precious metals involve risks. The value of gold may fluctuate due to market, geopolitical and macroeconomic factors.

The Fixed Price model reduces but does not eliminate volatility. Returns are not guaranteed. Digital assets (tokens) are an additional instrument and may be subject to technological risks.

Invest only funds you can afford to lose. Consult a financial adviser before making decisions.

Imperial Pure Gold DMCC does not provide individual investment advice. Last updated: March 2026.`
    }
  },
};

export function getLegalContent(lang: LegalLang, type: LegalType) {
  const key = (lang.toUpperCase() === 'RU' ? 'RU' : 'EN') as 'RU' | 'EN';
  return LEGAL_CONTENT[key][type];
}
