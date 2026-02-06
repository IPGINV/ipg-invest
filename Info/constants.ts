import { Language, Translation, TeamMember } from './types';

export const TEXTS: Record<'RU' | 'EN', Translation> = {
  RU: {
    navCompany: "КОМПАНИЯ",
    navProject: "ПРОЕКТ",
    navWallet: "КОШЕЛЕК",
    navMainSite: "ГЛАВНЫЙ САЙТ",
    contactBtn: "СВЯЗАТЬСЯ",
    
    marqueeLBMABench: "LBMA БЕНЧМАРК",
    marqueeSpotAU: "SPOT AU",
    marqueeInstLevel: "ИНСТИТУЦИОНАЛЬНЫЙ УРОВЕНЬ",
    marqueeLivePhysical: "ФИЗИЧЕСКИЙ МЕТАЛЛ",

    companyTitle: "О КОМПАНИИ",
    companySubtitle: "ЗОЛОТОЙ СТАНДАРТ ПРОЗРАЧНОСТИ И НАДЁЖНОСТИ",
    companyDescTitle: "Imperial Pure Gold DMCC",
    companyDescText1: "Мы — лицензированная компания в экономической зоне DMCC (Дубай), созданная для построения безопасных и прибыльных цепочек поставок физического золота между Африкой и Ближним Востоком.",
    companyDescText2: "Imperial Pure Gold DMCC — это больше, чем компания. Это структурированный подход к золоту, обеспечивающий максимальную безопасность активов и прозрачность всех операций.",
    licenseTitle: "ЛИЦЕНЗИЯ И РЕГУЛИРОВАНИЕ",
    licenseDownload: "СКАЧАТЬ PDF",
    licenseView: "ПОСМОТРЕТЬ",
    leadershipTitle: "РУКОВОДСТВО",
    externalLinkText: "ПЕРЕЙТИ НА IMPERIALPUREGOLD.AE",
    managerTitle: "Связь с менеджером",
    managerDesc: "Выберите удобный способ связи. Мы ответим в течение 15 минут.",
    managerTelegramSub: "Чат с менеджером",
    managerWhatsappSub: "Мгновенное сообщение",
    menuDashboard: "Личный Кабинет",
    menuCompany: "Компания",
    menuProject: "Проект",
    menuCalculator: "Калькулятор доходности",
    menuCompanySite: "Сайт компании",

    projectTabAbout: "О ПРОЕКТЕ",
    projectTabToken: "О ТОКЕНЕ",
    projectTitle: "ИНВЕСТИЦИОННАЯ ЭКОСИСТЕМА",
    projectDesc: "Наш проект объединяет реальный сектор экономики (добыча и торговля золотом) с цифровыми технологиями. Мы создаем прозрачную инфраструктуру для инвестиций в драгоценные металлы, минимизируя риски и устраняя посредников.",
    telegramBtn: "КАНАЛ ПРОЕКТА",

    tokenTitle: "ТОКЕН GHS",
    tokenDesc: "Golden Share (GHS) — это цифровой актив, обеспеченный реальными операциями с золотом. Токен предоставляет держателям право на участие в распределении прибыли компании.",
    tokenFeature1: "Обеспечение реальным золотом",
    tokenFeature2: "Регулярные дивиденды",
    tokenFeature3: "Полная прозрачность блокчейна",
    walletBtn: "ПЕРЕЙТИ В КОШЕЛЕК",

    footerCompliance: "КОМПЛАЕНС",
    footerNetwork: "СЕТЬ",
    footerSupport: "ПОДДЕРЖКА",
    footerPrivacy: "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ",
    footerRisk: "УВЕДОМЛЕНИЕ О РИСКАХ",
    footerTerms: "УСЛОВИЯ ИСПОЛЬЗОВАНИЯ",
  },
  EN: {
    navCompany: "COMPANY",
    navProject: "PROJECT",
    navWallet: "WALLET",
    navMainSite: "MAIN SITE",
    contactBtn: "CONTACT US",
    
    marqueeLBMABench: "LBMA BENCHMARK",
    marqueeSpotAU: "SPOT AU",
    marqueeInstLevel: "INSTITUTIONAL LEVEL",
    marqueeLivePhysical: "PHYSICAL METAL",

    companyTitle: "ABOUT COMPANY",
    companySubtitle: "THE GOLD STANDARD OF TRANSPARENCY AND RELIABILITY",
    companyDescTitle: "Imperial Pure Gold DMCC",
    companyDescText1: "We are a licensed company in the DMCC economic zone (Dubai), created to build safe and profitable supply chains of physical gold between Africa and the Middle East.",
    companyDescText2: "Imperial Pure Gold DMCC is more than a company. It is a structured approach to gold, ensuring maximum asset security and transparency of all operations.",
    licenseTitle: "LICENSE & REGULATION",
    licenseDownload: "DOWNLOAD PDF",
    licenseView: "VIEW",
    leadershipTitle: "LEADERSHIP",
    externalLinkText: "VISIT IMPERIALPUREGOLD.AE",
    managerTitle: "Contact Manager",
    managerDesc: "Choose a convenient way to contact us. We will reply within 15 minutes.",
    managerTelegramSub: "Chat with manager",
    managerWhatsappSub: "Instant message",
    menuDashboard: "Dashboard",
    menuCompany: "Company",
    menuProject: "Project",
    menuCalculator: "Profit Calculator",
    menuCompanySite: "Company website",

    projectTabAbout: "ABOUT PROJECT",
    projectTabToken: "ABOUT TOKEN",
    projectTitle: "INVESTMENT ECOSYSTEM",
    projectDesc: "Our project combines the real sector of the economy (gold mining and trading) with digital technologies. We create a transparent infrastructure for investing in precious metals, minimizing risks and eliminating intermediaries.",
    telegramBtn: "PROJECT CHANNEL",

    tokenTitle: "GHS TOKEN",
    tokenDesc: "Golden Share (GHS) is a digital asset backed by real gold operations. The token grants holders the right to participate in the company's profit distribution.",
    tokenFeature1: "Backed by physical gold",
    tokenFeature2: "Quarterly dividends",
    tokenFeature3: "Full blockchain transparency",
    walletBtn: "GO TO WALLET",

    footerCompliance: "COMPLIANCE",
    footerNetwork: "NETWORK",
    footerSupport: "SUPPORT",
    footerPrivacy: "PRIVACY POLICY",
    footerRisk: "RISK DISCLOSURE",
    footerTerms: "TERMS OF USE",
  }
};

export const TEAM: Record<Language, TeamMember[]> = {
  RU: [
    {
      name: "Rajesh Takurdas Sadhwani",
      role: "Управляющий по лицензии / Директор",
      image: "/images/team.svg"
    },
    {
      name: "Osman Nasr Mohammed",
      role: "Операционный директор",
      image: "/images/team.svg"
    }
  ],
  EN: [
    {
      name: "Rajesh Takurdas Sadhwani",
      role: "License Manager / Director",
      image: "/images/team.svg"
    },
    {
      name: "Osman Nasr Mohammed",
      role: "Operations Director",
      image: "/images/team.svg"
    }
  ]
};
