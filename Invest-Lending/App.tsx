import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck, 
  Lock, 
  Globe, 
  Send, 
  Phone, 
  Activity, 
  Check, 
  Info, 
  Coins, 
  Gem, 
  Layers, 
  LayoutGrid, 
  LayoutDashboard,
  Menu,
  X, 
  User, 
  Eye, 
  EyeOff, 
  Facebook, 
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Award,
  ExternalLink,
  MessageSquare,
  MessageCircle,
  PhoneCall,
  Ship,
  Building2,
  FileText,
  MapPin,
  Download,
  Wallet,
  Shield,
  CalendarDays,
  Maximize2,
  Minimize2,
  ArrowDown,
  Timer,
  RefreshCw,
  TrendingUp as TrendUpIcon,
  CircleDollarSign,
  BarChart3,
  Languages
} from 'lucide-react';
import { RegistrationForm } from './components/RegistrationForm';

// --- Types ---
type Step = 'HERO' | 'SIMULATION' | 'REGISTRATION' | 'SUCCESS';
type Language = 'RU' | 'EN';

interface PricePoint {
  time: string; // Label like "Янв"
  fullLabel: string; // Label like "Янв 2025"
  price: number;
}

interface DeliveryCycle {
  id: number;
  date: Date;
  labelRu: string;
  labelEn: string;
}

interface CompanyCard {
  title: string;
  paragraphs: string[];
  image: string;
  icon: React.ReactNode;
}

// --- Translations ---
const translations = {
  RU: {
    menu: "Меню",
    contact: "Связь",
    contactBtn: "Связаться",
    managerTitle: "Свяжитесь с нами",
    managerDesc: "Получите профессиональную консультацию по вопросам инвестиций и партнерства. Мы на связи 24/7.",
    managerTelegramSub: "Прямой чат в Telegram",
    managerWhatsappSub: "Связаться в WhatsApp",
    managerFacebookSub: "Imperial Pure Gold | Dubai",
    menuDashboard: "Личный Кабинет",
    menuCompany: "Компания",
    menuProject: "Проект",
    menuCalculator: "Калькулятор доходности",
    menuCompanySite: "Сайт компании",
    menuRegistration: "Регистрация",
    marqueeLBMABench: "LBMA БЕНЧМАРК",
    marqueeSpotAU: "SPOT AU",
    marqueeInstLevel: "ИНСТИТУЦИОНАЛЬНЫЙ УРОВЕНЬ",
    marqueeLivePhysical: "ФИЗИЧЕСКИЙ МЕТАЛЛ",
    heroBadge: "Гана — Дубай",
    heroTitle: "Инвестируйте в",
    heroTitleGold: "физическое золото",
    heroSlider: [
      "Зарабатывайте на международной торговле драгоценными металлами.",
      "Гарантированная доля в контракте на оптовую поставку Ганского золота покупателям мировой ювелирной столицы."
    ],
    heroBtnStart: "Подробнее",
    heroBtnAbout: "О проекте",
    heroCompliance: ["Лицензия DMCC", "Стандарт LBMA", "Физический актив"],
    heroCardValuation: "Целевая оценка портфеля",
    heroCardDesc: "Эксклюзивная модель прямого участия в циклах закупки сырья у артелей в Гане и последующей аффинажной переработке в ОАЭ с продажей через DMCC.",
    heroCardMore: "Подробнее",
    calcTitle: "Калькулятор",
    calcTitleGold: "профита",
    calcDesc: "Расчет доходности на базе актуального окна поставок физического золота.",
    calcBtnActivate: "Активировать аккаунт",
    calcLabelDelivery: "Ближайшая поставка",
    calcLabelCycles: "Доступно циклов",
    calcLabelCapital: "Капитал (USD)",
    calcLabelMin: "Мин. вход $100",
    calcLabelMax: "Макс. $100,000",
    calcLabelForecast: "Прогноз прибыли",
    calcLabelROI: "Чистый ROI",
    calcBtnTelegram: "Подробнее в телеграм канале",
    calcBtnFacebook: "Подробнее в Facebook",
    calcBtnLock: "Зафиксировать условия",
    regFormTitle: "Регистрация",
    regFormOr: "или",
    regLabelSurname: "Фамилия",
    regLabelName: "Имя",
    regLabelPhone: "Телефон",
    regLabelEmail: "Email адрес",
    regLabelPassword: "Пароль",
    regBtnNext: "Далее",
    regBtnBack: "Назад",
    regLabelTerms: "Принимаю",
    regLinkOffer: "оферту",
    regBtnOpen: "Открыть кабинет",
    successTitle: "Портфель создан",
    successDesc: "Ваша инвестиционная панель готова к работе. Бонусный токен зачислен на баланс.",
    successBadge: "+1 GHS Активирован",
    successLabelTarget: "Целевая оценка",
    successBtnDashboard: "В кабинет",
    successBtnBack: "На главную",
    footerCompliance: "Комплаенс",
    footerContacts: "Контакты",
    footerNetwork: "Сеть",
    footerSupport: "VIP Поддержка",
    footerDesc: "Imperial Pure Gold DMCC предоставляет доступ к институциональным инвестиционным инструментам на базе золота, обеспечивая безупречную ликвидность и стабильную доходность в любых рыночных условиях.",
    rights: "Все права защищены.",
    footerPrivacy: "Конфиденциальность",
    footerRisk: "Риски",
    footerTerms: "Условия",
    legalModalClose: "Закрыть",
    legalPrivacyTitle: "Политика конфиденциальности",
    legalPrivacyContent: "Imperial Pure Gold DMCC обязуется защищать персональные данные пользователей в соответствии с применимым законодательством ОАЭ и международными стандартами.\n\nМы собираем только необходимую информацию для оказания услуг: контактные данные, данные для идентификации и финансовой верификации. Информация хранится на защищённых серверах и не передаётся третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.\n\nВы имеете право на доступ, исправление и удаление своих данных. Для запросов обращайтесь: info@ipg-invest.ae.\n\nОбновлено: март 2026.",
    legalTermsTitle: "Условия использования",
    legalTermsContent: "Используя платформу Imperial Pure Gold DMCC, вы соглашаетесь с настоящими условиями.\n\nУслуги предоставляются лицензированной компанией в зоне DMCC (Дубай). Инвестиции в физическое золото несут рыночные риски. Прошлые результаты не гарантируют будущей доходности.\n\nМинимальный возраст пользователя — 18 лет. Клиент несёт ответственность за достоверность предоставленной информации и соблюдение законодательства своей юрисдикции.\n\nВсе споры регулируются законодательством ОАЭ. Imperial Pure Gold DMCC оставляет за собой право изменять условия с уведомлением пользователей.\n\nОбновлено: март 2026.",
    legalRisksTitle: "Предупреждение о рисках",
    legalRisksContent: "Инвестиции в драгоценные металлы сопряжены с рисками. Стоимость золота может колебаться под воздействием рыночных, геополитических и макроэкономических факторов.\n\nМодель Fixed Price уменьшает, но не устраняет волатильность. Доходность не гарантирована. Цифровые активы (токены) являются дополнительным инструментом и могут быть подвержены технологическим рискам.\n\nРекомендуется инвестировать только средства, потерю которых вы готовы принять. Перед принятием решений проконсультируйтесь с финансовым специалистом.\n\nImperial Pure Gold DMCC не даёт индивидуальных инвестиционных рекомендаций. Обновлено: март 2026.",
    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    cards: [
      {
        title: "Imperial Pure Gold DMCC",
        paragraphs: ["Лицензированная компания в экономической зоне DMCC (Дубай), созданная для построения безопасных и прибыльных цепочек поставок физического золота между Африкой и Ближним Востоком."]
      },
      {
        title: "Фиксированные цены",
        paragraphs: ["Работа по модели Fixed Price для защиты капитала.", "Обеспечение предсказуемой доходности до 8% за цикл.", "Эффективная защита от рыночной волатильности котировок."]
      },
      {
        title: "Наши принципы",
        paragraphs: ["Законность и строгое соблюдение мировых стандартов DMCC.", "Полная прозрачность и 100% обеспечение физическим активом.", "Долгосрочное партнерство и глобальное масштабирование."]
      },
      {
        title: "Цель компании",
        paragraphs: ["Сделать инвестиции в золото технологичным инструментом.", "Доступность и безопасность для требовательных инвесторов.", "Новый стандарт взаимодействия с физическим металлом."]
      },
      
    ],
    infoCompanyTitle: "О КОМПАНИИ",
    infoCompanyDescTitle: "Imperial Pure Gold DMCC",
    infoCompanyDescText1: "Мы — лицензированная компания в экономической зоне DMCC (Дубай), созданная для построения безопасных и прибыльных цепочек поставок физического золота между Африкой и Ближним Востоком.",
    infoCompanyDescText2: "Imperial Pure Gold DMCC — это больше, чем компания. Это структурированный подход к золоту, обеспечивающий максимальную безопасность активов и прозрачность всех операций.",
    infoLicenseTitle: "ЛИЦЕНЗИЯ И РЕГУЛИРОВАНИЕ",
    infoLicenseDownload: "СКАЧАТЬ PDF",
    infoLeadershipTitle: "РУКОВОДСТВО",
    infoExternalLinkText: "ПЕРЕЙТИ НА IMPERIALPUREGOLD.AE",
    infoProjectTabAbout: "О ПРОЕКТЕ",
    infoProjectTabToken: "О ТОКЕНЕ",
    infoProjectTitle: "ИНВЕСТИЦИОННАЯ ЭКОСИСТЕМА",
    infoProjectDesc: "Наш проект объединяет реальный сектор экономики (добыча и торговля золотом) с цифровыми технологиями. Мы создаем прозрачную инфраструктуру для инвестиций в драгоценные металлы, минимизируя риски и устраняя посредников.",
    infoTelegramBtn: "КАНАЛ ПРОЕКТА",
    infoTokenTitle: "ТОКЕН GHS",
    infoTokenDesc: "Golden Share (GHS) — это цифровой актив, обеспеченный реальными операциями с золотом. Токен предоставляет держателям право на участие в распределении прибыли компании.",
    infoTokenFeature1: "Обеспечение реальным золотом",
    infoTokenFeature2: "Регулярные дивиденды",
    infoTokenFeature3: "Полная прозрачность блокчейна",
    infoWalletBtn: "ПЕРЕЙТИ В КОШЕЛЕК",
    infoBackBtn: "Назад"
  },
  EN: {
    menu: "Menu",
    contact: "Contact",
    contactBtn: "Contact Us",
    managerTitle: "Contact Us",
    managerDesc: "Receive professional consultation on investment and partnership opportunities. Available 24/7.",
    managerTelegramSub: "Direct Telegram Chat",
    managerWhatsappSub: "Contact via WhatsApp",
    managerFacebookSub: "Imperial Pure Gold | Dubai",
    menuDashboard: "Dashboard",
    menuCompany: "Company",
    menuProject: "Project",
    menuCalculator: "Profit Calculator",
    menuCompanySite: "Company website",
    menuRegistration: "Registration",
    marqueeLBMABench: "LBMA BENCHMARK",
    marqueeSpotAU: "SPOT AU",
    marqueeInstLevel: "INSTITUTIONAL GRADE",
    marqueeLivePhysical: "PHYSICAL ASSET",
    heroBadge: "Ghana — Dubai",
    heroTitle: "Invest in",
    heroTitleGold: "physical gold",
    heroSlider: [
      "Earn from international precious metals trading.",
      "Guaranteed share in a contract for wholesale supply of Ghana gold to world jewelry capitals."
    ],
    heroBtnStart: "Learn more",
    heroBtnAbout: "About Project",
    heroCompliance: ["DMCC Licensed", "LBMA Standard", "Physical Asset"],
    heroCardValuation: "Portfolio Target Valuation",
    heroCardDesc: "An exclusive model of direct participation in cycles of purchasing raw materials from Ghana and subsequent refinery in the UAE with sales via DMCC.",
    heroCardMore: "Learn More",
    calcTitle: "Profit",
    calcTitleGold: "Calculator",
    calcDesc: "Calculate returns based on the current window for physical gold supplies.",
    calcBtnActivate: "Activate Account",
    calcLabelDelivery: "Next Delivery",
    calcLabelCycles: "Cycles Available",
    calcLabelCapital: "Capital (USD)",
    calcLabelMin: "Min entry $100",
    calcLabelMax: "Max $100,000",
    calcLabelForecast: "Forecast Return",
    calcLabelROI: "Net ROI",
    calcBtnTelegram: "More info in Telegram",
    calcBtnFacebook: "More info in Facebook",
    calcBtnLock: "Fix the conditions",
    regFormTitle: "Registration",
    regFormOr: "or",
    regLabelSurname: "Surname",
    regLabelName: "First Name",
    regLabelPhone: "Phone",
    regLabelEmail: "Email Address",
    regLabelPassword: "Password",
    regBtnNext: "Next",
    regBtnBack: "Back",
    regLabelTerms: "I accept",
    regLinkOffer: "offer",
    regBtnOpen: "Open Dashboard",
    successTitle: "Portfolio Created",
    successDesc: "Your investment panel is ready. Bonus token has been credited to your balance.",
    successBadge: "+1 GHS Activated",
    successLabelTarget: "Target Valuation",
    successBtnDashboard: "Dashboard",
    successBtnBack: "Back Home",
    footerCompliance: "Compliance",
    footerContacts: "Contacts",
    footerNetwork: "Network",
    footerSupport: "VIP Support",
    footerDesc: "Imperial Pure Gold DMCC provides access to institutional-grade gold investment vehicles, ensuring flawless liquidity and stable returns in any market conditions.",
    rights: "All Rights Reserved.",
    footerPrivacy: "Privacy",
    footerRisk: "Risks",
    footerTerms: "Terms",
    legalModalClose: "Close",
    legalPrivacyTitle: "Privacy Policy",
    legalPrivacyContent: "Imperial Pure Gold DMCC is committed to protecting your personal data in accordance with applicable UAE law and international standards.\n\nWe collect only the information necessary to provide our services: contact details, identity and financial verification data. Information is stored on secured servers and is not shared with third parties without your consent, except as required by law.\n\nYou have the right to access, correct and delete your data. For requests, contact: info@ipg-invest.ae.\n\nLast updated: March 2026.",
    legalTermsTitle: "Terms of Use",
    legalTermsContent: "By using the Imperial Pure Gold DMCC platform, you agree to these terms.\n\nServices are provided by a licensed company in the DMCC zone (Dubai). Investments in physical gold carry market risks. Past performance does not guarantee future returns.\n\nMinimum user age is 18. The client is responsible for the accuracy of information provided and compliance with the laws of their jurisdiction.\n\nAll disputes are governed by UAE law. Imperial Pure Gold DMCC reserves the right to amend terms with notice to users.\n\nLast updated: March 2026.",
    legalRisksTitle: "Risk Warning",
    legalRisksContent: "Investments in precious metals involve risks. The value of gold may fluctuate due to market, geopolitical and macroeconomic factors.\n\nThe Fixed Price model reduces but does not eliminate volatility. Returns are not guaranteed. Digital assets (tokens) are an additional instrument and may be subject to technological risks.\n\nInvest only funds you can afford to lose. Consult a financial adviser before making decisions.\n\nImperial Pure Gold DMCC does not provide individual investment advice. Last updated: March 2026.",
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    cards: [
      {
        title: "Imperial Pure Gold DMCC",
        paragraphs: ["Licensed company in the DMCC economic zone (Dubai), created to build secure and profitable supply chains of physical gold between Africa and the Middle East."]
      },
      {
        title: "Fixed Prices",
        paragraphs: ["Fixed Price model to protect your capital.", "Predictable returns up to 8% per cycle.", "Effective protection against market volatility."]
      },
      {
        title: "Our Principles",
        paragraphs: ["Compliance with global DMCC standards.", "Full transparency and 100% physical asset backing.", "Long-term partnership and global scalability."]
      },
      {
        title: "Company Goal",
        paragraphs: ["Making gold investment a technological tool.", "Accessibility and security for demanding investors.", "A new standard for physical metal interaction."]
      },
      
    ],
    infoCompanyTitle: "ABOUT COMPANY",
    infoCompanyDescTitle: "Imperial Pure Gold DMCC",
    infoCompanyDescText1: "We are a licensed company in the DMCC economic zone (Dubai), created to build safe and profitable supply chains of physical gold between Africa and the Middle East.",
    infoCompanyDescText2: "Imperial Pure Gold DMCC is more than a company. It is a structured approach to gold, ensuring maximum asset security and transparency of all operations.",
    infoLicenseTitle: "LICENSE & REGULATION",
    infoLicenseDownload: "DOWNLOAD PDF",
    infoLeadershipTitle: "LEADERSHIP",
    infoExternalLinkText: "VISIT IMPERIALPUREGOLD.AE",
    infoProjectTabAbout: "ABOUT PROJECT",
    infoProjectTabToken: "ABOUT TOKEN",
    infoProjectTitle: "INVESTMENT ECOSYSTEM",
    infoProjectDesc: "Our project combines the real sector of the economy (gold mining and trading) with digital technologies. We create a transparent infrastructure for investing in precious metals, minimizing risks and eliminating intermediaries.",
    infoTelegramBtn: "PROJECT CHANNEL",
    infoTokenTitle: "GHS TOKEN",
    infoTokenDesc: "Golden Share (GHS) is a digital asset backed by real gold operations. The token grants holders the right to participate in the company's profit distribution.",
    infoTokenFeature1: "Backed by physical gold",
    infoTokenFeature2: "Quarterly dividends",
    infoTokenFeature3: "Full blockchain transparency",
    infoWalletBtn: "GO TO WALLET",
    infoBackBtn: "Back"
  }
};

// --- TEAM for Info pages ---
const TEAM: Record<Language, { name: string; role: string; image: string }[]> = {
  RU: [
    { name: "Rajesh Takurdas Sadhwani", role: "Управляющий по лицензии / Директор", image: "/images/team/rajesh-takurdas-sadhwani.png" },
    { name: "Osman Nasr Mohammed", role: "Операционный директор", image: "/images/team/osman-nasr-mohammed.png" }
  ],
  EN: [
    { name: "Rajesh Takurdas Sadhwani", role: "License Manager / Director", image: "/images/team/rajesh-takurdas-sadhwani.png" },
    { name: "Osman Nasr Mohammed", role: "Operations Director", image: "/images/team/osman-nasr-mohammed.png" }
  ]
};

// --- Custom Logo Component ---
const Logo = ({ className = "", size = 24 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 115" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M50 2L95 28V87L50 113L5 87V28L50 2Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
    <path d="M50 2V45M50 45L95 28M50 45L5 28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M50 113V70M50 70L95 87M50 70L5 87" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- Constants ---
const METAL_PRICE_API_KEY = 'd74227f0722d7eb9cf7b1dd6ebc5cad6';
const CACHE_KEY = 'imperial_gold_price_data_v4';
const CACHE_EXPIRY = 60 * 60 * 1000; 

const DELIVERY_SCHEDULE: DeliveryCycle[] = [
  { id: 1, date: new Date('2026-02-16'), labelRu: '16 Фев, 2026', labelEn: '16 Feb, 2026' },
  { id: 2, date: new Date('2026-03-13'), labelRu: '13 Мар, 2026', labelEn: '13 Mar, 2026' },
  { id: 3, date: new Date('2026-04-07'), labelRu: '07 Апр, 2026', labelEn: '07 Apr, 2026' },
  { id: 4, date: new Date('2026-05-04'), labelRu: '04 Май, 2026', labelEn: '04 May, 2026' },
  { id: 5, date: new Date('2026-05-29'), labelRu: '29 Май, 2026', labelEn: '29 May, 2026' },
  { id: 6, date: new Date('2026-06-23'), labelRu: '23 Июн, 2026', labelEn: '23 Jun, 2026' },
  { id: 7, date: new Date('2026-07-20'), labelRu: '20 Июл, 2026', labelEn: '20 Jul, 2026' },
  { id: 8, date: new Date('2026-08-14'), labelRu: '14 Авг, 2026', labelEn: '14 Aug, 2026' },
  { id: 9, date: new Date('2026-09-08'), labelRu: '08 Сен, 2026', labelEn: '08 Sep, 2026' },
  { id: 10, date: new Date('2026-10-05'), labelRu: '05 Окт, 2026', labelEn: '05 Oct, 2026' },
  { id: 11, date: new Date('2026-10-30'), labelRu: '30 Окт, 2026', labelEn: '30 Oct, 2026' },
  { id: 12, date: new Date('2026-11-24'), labelRu: '24 Ноя, 2026', labelEn: '24 Nov, 2026' },
  { id: 13, date: new Date('2026-12-21'), labelRu: '21 Дек, 2026', labelEn: '21 Dec, 2026' },
  { id: 14, date: new Date('2027-01-18'), labelRu: '18 Янв, 2027', labelEn: '18 Jan, 2027' },
];

// --- Helper for Dynamic Chart Labels (Past 6 months window) ---
const generatePastSixMonths = (lang: Language): PricePoint[] => {
  const result: PricePoint[] = [];
  const now = new Date();
  
  // Start from 5 months ago to get a total of 6 points including current
  const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const months = translations[lang].months;
  
  for (let i = 0; i < 6; i++) {
    const currentPointDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const mIdx = currentPointDate.getMonth();
    const year = currentPointDate.getFullYear();
    
    result.push({
      time: months[mIdx],
      fullLabel: `${months[mIdx]} ${year}`,
      price: 2600 + (i * 35) + (Math.random() * 40 - 20) 
    });
  }
  
  return result;
};

// --- Sub-components ---
const AnimatedParagraphs = ({ paragraphs, keyId }: { paragraphs: string[], keyId: string }) => {
  return (
    <div className="flex flex-col gap-4 md:gap-6 relative min-h-[160px] md:min-h-[220px] justify-center text-center">
      {paragraphs.map((text, idx) => (
        <p 
          key={`${keyId}-${idx}`} 
          className="text-sm md:text-base text-white/80 font-medium leading-relaxed italic animate-in fade-in slide-in-from-left duration-1000 fill-mode-both text-center"
          style={{ animationDelay: `${idx * 400 + 200}ms` }}
        >
          {text}
        </p>
      ))}
    </div>
  );
};

const InlineProjectView = ({ t, lang }: { t: Record<string, any>; lang: Language }) => {
  const [activeTab, setActiveTab] = useState<'project' | 'token'>('project');
  return (
    <>
      <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black tracking-tight text-stone-900 mb-8">{t.infoProjectTitle}</h2>
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
          <button onClick={() => setActiveTab('project')} className={`px-6 py-3 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest transition-all ${activeTab === 'project' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}>
            {t.infoProjectTabAbout}
          </button>
          <button onClick={() => setActiveTab('token')} className={`px-6 py-3 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest transition-all ${activeTab === 'token' ? 'bg-white text-stone-900 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}>
            {t.infoProjectTabToken}
          </button>
        </div>
      </div>
      {activeTab === 'project' && (
        <div className="luxury-card p-6 md:p-10 overflow-hidden relative group mb-8">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Globe size={120} className="text-stone-400" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <p className="text-xl md:text-2xl font-light text-stone-700 leading-relaxed">{t.infoProjectDesc}</p>
              <div className="h-[2px] w-20 bg-[#d4af37] rounded-full" />
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-3 border-2 border-[#d4af37] text-[#d4af37] font-black text-[10px] font-mono uppercase tracking-widest rounded-2xl hover:bg-[#d4af37] hover:text-stone-900 transition-all">
                {t.infoTelegramBtn} <Send size={16} />
              </a>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <img
                  src="/images/project/golden-sheare.png"
                  alt="Golden Share"
                  className="w-full h-auto rounded-2xl shadow-xl border border-[#d4af37]/20"
                />
                <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-white p-2 rounded-2xl shadow-lg border border-black/5 rotate-6">
                  <img
                    src="/images/project/token.png"
                    alt="Token"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'token' && (
        <div className="luxury-card p-6 md:p-10 overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 blur-[100px] rounded-full" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#d4af37] mb-2 block">GHS</span>
                <h3 className="text-3xl font-['Playfair_Display'] font-black tracking-tight text-stone-900 mb-4">{t.infoTokenTitle}</h3>
                <p className="text-stone-600 leading-relaxed">{t.infoTokenDesc}</p>
              </div>
              <ul className="space-y-4">
                {[t.infoTokenFeature1, t.infoTokenFeature2, t.infoTokenFeature3].map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-4 text-stone-700 font-medium border-b border-stone-100 pb-4 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#d4af37] flex-shrink-0">
                      {i === 0 ? <Shield size={18} /> : i === 1 ? <Wallet size={18} /> : <Layers size={18} />}
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#" className="inline-flex items-center gap-3 px-8 py-4 bg-[#d4af37] text-stone-900 font-black text-[10px] font-mono uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-xl">
                {t.infoWalletBtn} <ArrowRight size={16} />
              </a>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-2 border-[#d4af37]/30 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[#d4af37] shadow-lg flex items-center justify-center flex-col">
                    <span className="font-['Playfair_Display'] font-black text-3xl text-stone-900/90">GHS</span>
                    <span className="text-[8px] font-mono font-black tracking-widest text-stone-900/70 mt-1">TOKEN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const HeroTextSlider = ({ slides }: { slides: string[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-32 md:h-40 w-full max-w-2xl mb-8 md:mb-12 overflow-hidden flex flex-col justify-center px-4 md:px-2">
      {slides.map((text, i) => (
        <div 
          key={i}
          className={`absolute inset-0 flex items-center justify-center lg:justify-start transition-all duration-1000 ease-in-out px-4 md:px-2 ${
            i === current ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex gap-4 items-start border-l-4 border-[#d4af37] pl-6 md:pl-8 py-2 max-w-full">
            <p className="text-[#f0f0f0]/90 text-base md:text-xl font-medium leading-relaxed italic drop-shadow-lg text-center lg:text-left break-words max-w-full">
              {text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }[] = [];
    const Particle = function(this: any) {
      this.x = Math.random() * canvas!.width;
      this.y = Math.random() * canvas!.height;
      this.size = Math.random() * (window.innerWidth > 1024 ? 2 : 1.2) + 0.1;
      this.speedX = Math.random() * 0.15 - 0.075;
      this.speedY = Math.random() * 0.15 - 0.075;
      this.opacity = Math.random() * 0.35 + 0.05;
      this.color = Math.random() > 0.7 ? '#d4af37' : '#ffffff';
    } as any;
    (Particle.prototype as any).update = function() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x > canvas!.width) this.x = 0; else if (this.x < 0) this.x = canvas!.width;
      if (this.y > canvas!.height) this.y = 0; else if (this.y < 0) this.y = canvas!.height;
    };
    (Particle.prototype as any).draw = function() {
      ctx!.beginPath(); ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx!.fillStyle = this.color; ctx!.globalAlpha = this.opacity; ctx!.fill(); ctx!.globalAlpha = 1;
    };
    const init = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      particles = []; const count = window.innerWidth > 1024 ? 70 : 25;
      for (let i = 0; i < count; i++) particles.push(new (Particle as any)());
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p: any) => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    init(); animate();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="bg-mesh" />
      <div className="gold-orb top-[-15%] left-[-10%] opacity-60" />
      <div className="gold-orb bottom-[-25%] right-[-10%] opacity-50" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141417]/20 to-[#141417] z-10" />
      <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-[0.25] saturate-[0.2] mix-blend-screen transition-opacity duration-1000" alt="" />
    </div>
  );
};

type AppProps = {
  apiBase?: string;
};

export default function App({ apiBase }: AppProps) {
  const [lang, setLang] = useState<Language>('RU');
  const t = translations[lang];

  const [step, setStep] = useState<Step>('HERO');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [amount, setAmount] = useState(50000); 
  const [marketData, setMarketData] = useState<PricePoint[]>(() => generatePastSixMonths('RU'));
  const [currencyRates, setCurrencyRates] = useState({ AED: 3.67, RUB: 91.42 });
  const [currentCard, setCurrentCard] = useState(0);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [lockedAmount, setLockedAmount] = useState<number | null>(null);
  const [infoView, setInfoView] = useState<'company' | 'project' | null>(null);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'risks' | null>(null);

  const resolveLocalBase = (port: number) => {
    const host = window.location.hostname;
    const isLocalLike =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
    return isLocalLike ? `http://${host}:${port}` : null;
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const registrationRef = useRef<HTMLDivElement>(null);
  const envApiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const resolveApiBase = () => {
    if (apiBase) return apiBase;
    const runtimeBase = (window as any).__IPG_API_BASE as string | undefined;
    if (runtimeBase) return runtimeBase;
    const host = window.location.hostname;
    const isLocalLike =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
    if (isLocalLike) {
      return envApiBase || 'http://localhost:3005';
    }
    return envApiBase || 'https://api.ipg-invest.ae';
  };

  useEffect(() => {
    if (!apiBase) return;
    fetch(`${apiBase}/health`).catch(() => {});
  }, [apiBase]);

  // Проверка URL параметров для прямого открытия калькулятора
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const stepParam = params.get('step');
    const decodedSearch = decodeURIComponent(window.location.search || '');
    const encodedRegistrationStep = decodedSearch.includes('step=REGISTRATION');
    
    if (view === 'calculator' || stepParam === 'SIMULATION') {
      setStep('SIMULATION');
      // Очищаем параметры из URL после обработки
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (stepParam === 'REGISTRATION' || encodedRegistrationStep) {
      setStep('REGISTRATION');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('ipg:locked-amount');
    if (!stored) return;
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      setLockedAmount(parsed);
    }
  }, []);

  // Optional: load cached registration payload if needed

  // --- Localization Logic ---
  const companyCards = useMemo(() => [
    { ...t.cards[0], image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1000", icon: <Logo size={24} /> },
    { ...t.cards[1], image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000", icon: <ShieldCheck size={24} /> },
    { ...t.cards[2], image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=1000", icon: <Gem size={24} /> },
    { ...t.cards[3], image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000", icon: <Award size={24} /> }
  ], [lang, t.cards]);

  const remainingCycles = useMemo(() => {
    const filtered = DELIVERY_SCHEDULE.filter(d => d.date > new Date());
    return filtered.length > 0 ? filtered.length : 1; 
  }, []);

  const nextDelivery = useMemo(() => {
    const now = new Date();
    return DELIVERY_SCHEDULE.find(d => d.date > now) || DELIVERY_SCHEDULE[0];
  }, []);

  // --- Fetching Logic using MetalPriceAPI and Past 6 Months ---
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, rates, lastPrice } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setCurrencyRates(rates);
            const pastSix = generatePastSixMonths(lang);
            // Anchor historical trend to live price
            const trending = pastSix.map((p, i) => {
               const trendFactor = (i / (pastSix.length - 1));
               // Simulate realistic 6-month growth (approx 5-10% total)
               const base = lastPrice * (0.92 + (trendFactor * 0.08));
               return { ...p, price: Math.round(base + (Math.random() * 20 - 10)) };
            });
            trending[trending.length - 1].price = lastPrice;
            setMarketData(trending);
            return;
          }
        }

        const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,AED,RUB`);
        const result = await response.json();

        if (result.success && result.rates) {
          const goldPricePerOunce = 1 / result.rates.XAU; 
          const livePrice = Math.round(goldPricePerOunce || 2780);
          
          const newRates = {
            AED: parseFloat(result.rates.AED.toFixed(2)) || 3.67,
            RUB: parseFloat(result.rates.RUB.toFixed(2)) || 91.42
          };
          setCurrencyRates(newRates);

          const pastSix = generatePastSixMonths(lang);
          const trending = pastSix.map((p, i) => {
             const trendFactor = (i / (pastSix.length - 1));
             const base = livePrice * (0.92 + (trendFactor * 0.08));
             return { ...p, price: Math.round(base + (Math.random() * 20 - 10)) };
          });
          trending[trending.length - 1].price = livePrice;
          
          setMarketData(trending);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ 
            timestamp: Date.now(), 
            lastPrice: livePrice,
            rates: newRates
          }));
        }
      } catch (err) { 
        console.error('Error fetching market prices:', err);
        setMarketData(generatePastSixMonths(lang));
      }
    };
    fetchPrices();
  }, [lang]);

  const finalAmount = useMemo(() => Math.round(amount * (1 + 0.0686 * remainingCycles)), [amount, remainingCycles]);
  const roi = amount > 0 ? Math.round(((finalAmount - amount) / amount) * 100) : 0;

  const nextStep = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const openRegistrationFromCalculator = () => {
    setLockedAmount(amount);
    localStorage.setItem('ipg:locked-amount', String(amount));
    nextStep('REGISTRATION');
  };

  const openRegistrationGeneric = () => {
    setLockedAmount(null);
    localStorage.removeItem('ipg:locked-amount');
    nextStep('REGISTRATION');
  };

  const buildLoginUrl = (nextFlow?: string) => {
    const envDashboard = (import.meta as any).env?.VITE_DASHBOARD_APP_URL as string | undefined;
    const localBase = envDashboard || resolveLocalBase(3000);
    const loginBase = localBase ? `${localBase.replace(/\/$/, '')}/login.html` : 'https://dashboard.ipg-invest.ae/login.html';
    if (!nextFlow) return loginBase;
    const url = new URL(loginBase);
    url.searchParams.set('next', nextFlow);
    return url.toString();
  };

  const handleOpenDashboard = () => {
    // Вход по логину и паролю — всегда на страницу входа
    window.location.href = buildLoginUrl();
  };

  const openInfoView = (view: 'company' | 'project') => {
    setIsMenuOpen(false);
    setInfoView(view);
  };

  const openCalculator = () => {
    setIsMenuOpen(false);
    openRegistrationGeneric();
  };


  const currentPrice = marketData[marketData.length - 1]?.price || 2780;
  const yearlyGrowth = marketData.length > 1 ? (((marketData[marketData.length - 1].price - marketData[0].price) / marketData[0].price) * 100).toFixed(1) : '8.4';

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#d4af37] selection:text-black font-inter text-[#f0f0f0] overflow-x-hidden">
      <InteractiveBackground />

      {/* Marquee — Info standard h-8 */}
      <div className={`fixed top-0 w-full z-[100] bg-[#0a0a0a] border-b border-white/5 h-8 flex items-center overflow-hidden transition-all duration-500 ease-out ${isOfferModalOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center shrink-0">
              <span className="text-[10px] font-mono font-bold text-[#d4af37] px-8 uppercase tracking-widest flex items-center gap-2">
                <Gem size={10} /> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)
              </span>
              <span className="text-[10px] font-mono font-bold text-white/30 px-8 uppercase tracking-widest">{t.marqueeSpotAU}: ${currentPrice.toLocaleString()}</span>
              <span className="text-[10px] font-mono font-bold text-white/30 px-8 uppercase tracking-widest">USD/AED: {currencyRates.AED}</span>
              <span className="text-[10px] font-mono font-bold text-[#d4af37] px-8 uppercase tracking-widest">{t.marqueeInstLevel}</span>
              <span className="text-[10px] font-mono font-bold text-white/30 px-8 uppercase tracking-widest">USD/RUB: {currencyRates.RUB}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header — Info standard h-16 */}
      <header className={`fixed top-8 left-0 w-full z-[90] bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-3 md:px-12 h-16 flex justify-between items-center transition-all duration-500 ease-out ${isOfferModalOpen ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className="flex items-center gap-3 p-1 pr-4 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              {isMenuOpen ? <X className="text-black" size={16} /> : <Menu className="text-black" size={16} />}
            </div>
            <div className="flex flex-col">
              <span className="font-playfair font-black text-[10px] uppercase tracking-tight leading-tight text-white">Imperial</span>
              <span className="font-playfair font-black text-[10px] uppercase tracking-tight leading-tight text-white">Pure Gold</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex p-1 rounded-lg border bg-white/5 border-white/10">
            {(['RU', 'EN'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rounded transition-all ${lang === l ? 'bg-[#d4af37] text-black shadow-sm' : 'text-white/40 hover:text-white'}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => setIsManagerModalOpen(true)} className="hidden md:flex items-center justify-center px-6 h-9 rounded-xl bg-[#d4af37] text-black text-[10px] font-mono font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20">
            {t.contactBtn}
          </button>
          <button onClick={() => setIsManagerModalOpen(true)} className="md:hidden w-9 h-9 rounded-xl bg-[#d4af37] flex items-center justify-center text-black shadow-lg shadow-[#d4af37]/20 flex-shrink-0">
            <Phone size={16} />
          </button>
        </div>
      </header>

      {/* MODALS & MENU */}
      {isManagerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#141417]/80 backdrop-blur-sm" onClick={() => setIsManagerModalOpen(false)}></div>
           <div className="relative glass-card p-8 md:p-12 rounded-[3rem] w-full max-sm:mx-4 max-w-sm border-[#d4af37]/20 flex flex-col items-center animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsManagerModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-all"><X size={24} /></button>
              <div className="w-16 h-16 md:w-20 md:h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl"><User className="text-black" size={32} /></div>
              <h3 className="text-3xl md:text-4xl font-playfair font-black tracking-tight text-white text-center mb-4">{t.managerTitle}</h3>
              <p className="text-white/40 text-center text-sm md:text-base mb-10 font-medium mx-auto max-w-[220px]">{t.managerDesc}</p>
              <div className="flex flex-col gap-4 w-full">
                 <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform"><Send size={24} /></div>
                    <span className="text-white font-black text-base">Telegram</span>
                 </a>
                 <a href="https://wa.me/971529657370" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-green-500/40 hover:bg-white/[0.08] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                    <span className="text-white font-black text-base">WhatsApp</span>
                 </a>
                 <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#1877f2]/40 hover:bg-white/[0.08] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#1877f2]/20 flex items-center justify-center text-[#1877f2] group-hover:scale-110 transition-transform"><Facebook size={24} /></div>
                    <span className="text-white font-black text-base">Facebook</span>
                 </a>
              </div>
           </div>
        </div>
      )}

      {/* Inline Info Pages: Company & Project (duplicates, no redirect to cabinet) */}
      {infoView && (
        <div className="fixed inset-0 top-0 z-[250] bg-[#f5f5f7] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#f5f5f7] border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
            <button
              onClick={() => setInfoView(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-black text-sm hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft size={18} /> {t.infoBackBtn}
            </button>
            <button onClick={() => setLang(lang === 'EN' ? 'RU' : 'EN')} className="px-3 py-2 rounded-xl border border-stone-200 text-stone-600 text-[10px] font-mono font-bold uppercase tracking-widest">
              {lang === 'EN' ? 'RU' : 'EN'}
            </button>
          </div>
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {infoView === 'company' && (
              <>
                <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black tracking-tight text-stone-900 mb-2">{t.infoCompanyTitle}</h2>
                <p className="text-stone-500 font-mono text-xs tracking-widest mb-8">Imperial Pure Gold</p>
                <div className="luxury-card p-6 md:p-10 overflow-hidden relative group mb-8">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Building2 size={120} className="text-stone-400" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-['Playfair_Display'] font-black tracking-tight text-stone-900 border-l-2 border-[#d4af37] pl-6 mb-4">{t.infoCompanyDescTitle}</h3>
                    <div className="text-stone-600 leading-relaxed space-y-4">
                      <p>{t.infoCompanyDescText1}</p>
                      <p>{t.infoCompanyDescText2}</p>
                    </div>
                    <a href="https://imperialpuregold.ae" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-[#d4af37] font-black text-[10px] font-mono uppercase tracking-widest hover:text-stone-900 transition-colors mt-6">
                      {t.infoExternalLinkText} <Globe size={14} />
                    </a>
                    <p className="flex items-center gap-2 text-sm text-stone-500 pt-4"><MapPin size={18} className="text-stone-400" /> Dubai, UAE</p>
                  </div>
                </div>
                <div className="luxury-card p-6 md:p-10 relative overflow-hidden group mb-8">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                    <FileText size={120} className="text-stone-400" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-['Playfair_Display'] font-black tracking-tight text-stone-900 mb-2">{t.infoLicenseTitle}</h3>
                      <p className="text-stone-500 text-sm font-mono tracking-widest">DMCC-944655</p>
                    </div>
                    <a href="https://imperialpuregold.ae/license.pdf" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-stone-900 font-black text-[10px] font-mono uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-lg">
                      <Download size={14} /> {t.infoLicenseDownload}
                    </a>
                  </div>
                </div>
                <h3 className="text-[10px] font-mono font-black uppercase tracking-widest text-gray-400 mb-8 text-center">{t.infoLeadershipTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  {TEAM[lang].map((member, idx) => (
                    <div key={idx} className="luxury-card p-6 group overflow-hidden">
                      <div className="aspect-square overflow-hidden rounded-2xl mb-4 border border-stone-100 bg-stone-100">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-stone-900 font-['Playfair_Display'] font-black tracking-tight text-lg">{member.name}</h4>
                      <p className="text-[#d4af37] text-[10px] font-mono font-black uppercase tracking-widest mt-2">{member.role}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {infoView === 'project' && (
              <InlineProjectView t={t} lang={lang} />
            )}
          </div>
        </div>
      )}

      {/* Legal Modal: Privacy, Terms, Risks */}
      {legalModal && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#0c0c0e]/90 backdrop-blur-sm" onClick={() => setLegalModal(null)} aria-hidden />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden glass-card rounded-2xl md:rounded-3xl border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg md:text-xl font-playfair font-black text-white">
                {legalModal === 'privacy' && (t.legalPrivacyTitle as string)}
                {legalModal === 'terms' && (t.legalTermsTitle as string)}
                {legalModal === 'risks' && (t.legalRisksTitle as string)}
              </h3>
              <button onClick={() => setLegalModal(null)} className="p-2 text-white/40 hover:text-white rounded-lg transition-colors" aria-label={t.legalModalClose as string}>
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 text-sm md:text-base text-white/80 leading-relaxed whitespace-pre-line">
              {legalModal === 'privacy' && (t.legalPrivacyContent as string)}
              {legalModal === 'terms' && (t.legalTermsContent as string)}
              {legalModal === 'risks' && (t.legalRisksContent as string)}
            </div>
            <div className="p-4 md:p-6 border-t border-white/10 flex-shrink-0">
              <button onClick={() => setLegalModal(null)} className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                {t.legalModalClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hamburger — Info standard: left slide */}
      {isMenuOpen && (
        <>
          <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm" />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs z-[160] bg-white border-r border-black/5 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div className="flex flex-col">
                <span className="font-playfair font-black text-[10px] uppercase tracking-tight text-[#d4af37]">Imperial</span>
                <span className="font-playfair font-black text-[10px] uppercase tracking-tight text-black">Pure Gold</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsMenuOpen(false); nextStep('REGISTRATION'); }} className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-[10px] font-mono font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-md">
                  {t.menuRegistration}
                </button>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black/40 hover:text-black"><X size={24} /></button>
              </div>
            </div>
            <nav className="flex flex-col gap-1 w-full">
              <button onClick={handleOpenDashboard} className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left w-full group text-black/60 hover:bg-black/5 hover:text-black">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-black/20 group-hover:text-[#d4af37]"><LayoutDashboard size={20} /></span>
                <span className="text-sm font-black uppercase tracking-widest flex-1 text-left">{t.menuDashboard}</span>
              </button>
              <button onClick={() => openInfoView('company')} className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left w-full group text-black/60 hover:bg-black/5 hover:text-black">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-black/20 group-hover:text-[#d4af37]"><Building2 size={20} /></span>
                <span className="text-sm font-black uppercase tracking-widest flex-1 text-left">{t.menuCompany}</span>
              </button>
              <button onClick={() => openInfoView('project')} className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left w-full group text-black/60 hover:bg-black/5 hover:text-black">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-black/20 group-hover:text-[#d4af37]"><Info size={20} /></span>
                <span className="text-sm font-black uppercase tracking-widest flex-1 text-left">{t.menuProject}</span>
              </button>
              <button onClick={openCalculator} className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left w-full group text-black/60 hover:bg-black/5 hover:text-black">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-black/20 group-hover:text-[#d4af37]"><BarChart3 size={20} /></span>
                <span className="text-sm font-black uppercase tracking-widest flex-1 text-left">{t.menuCalculator}</span>
              </button>
              <div className="h-px bg-black/5 my-6" />
              <button onClick={() => { setIsMenuOpen(false); setIsManagerModalOpen(true); }} className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left w-full group text-black/60 hover:bg-black/5 hover:text-black">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-black/20 group-hover:text-[#d4af37]"><Phone size={20} /></span>
                <span className="text-sm font-black uppercase tracking-widest flex-1 text-left">{t.contactBtn}</span>
              </button>
              <button onClick={() => { setIsMenuOpen(false); window.location.href = 'https://imperialpuregold.ae'; }} className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left w-full group text-black/60 hover:bg-black/5 hover:text-black">
                <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-black/20 group-hover:text-[#d4af37]"><Globe size={20} /></span>
                <span className="text-sm font-black uppercase tracking-widest flex-1 text-left">{t.menuCompanySite}</span>
              </button>
              <div className="h-px bg-black/5 my-4" />
              <div className="flex items-center justify-center gap-3 -mt-2">
                <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center text-[#1877f2] hover:border-[#1877f2]/40 hover:bg-[#1877f2]/10 transition-all" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center text-[#0088cc] hover:border-[#0088cc]/40 hover:bg-[#0088cc]/10 transition-all" aria-label="Telegram">
                  <Send size={18} />
                </a>
                <a href="https://api.whatsapp.com/send/?phone=447776177435&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-black/10 bg-black/5 flex items-center justify-center text-green-600 hover:border-green-500/40 hover:bg-green-500/10 transition-all" aria-label="WhatsApp">
                  <MessageCircle size={18} />
                </a>
              </div>
              <div className="h-px bg-black/5 mt-2 mb-4" />
            </nav>
            <div className="mt-auto pt-6 border-t border-black/5">
              <p className="text-[10px] font-mono text-black/20 uppercase tracking-widest">© {new Date().getFullYear()} Imperial Pure Gold</p>
            </div>
          </div>
        </>
      )}

      {/* MAIN CONTAINER */}
      <main className="relative z-10 pt-28 md:pt-36 pb-24 px-0 md:px-12 flex-1 flex flex-col items-stretch overflow-hidden w-full">
        {step === 'HERO' && (
          <div ref={heroRef} className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-24 items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 min-h-[calc(100dvh-8rem)] md:min-h-0 px-6 md:px-6">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full overflow-hidden">
              <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full mb-8 md:mb-12 pulse-gold">
                 <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_green]"></span>
                 <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">{t.heroBadge}</span>
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-9xl font-['Playfair_Display'] font-black tracking-tight text-white mb-8 md:mb-10 leading-[1.15] md:leading-[1] drop-shadow-md break-words w-full max-w-full">{t.heroTitle} <br/> <span className="text-gold italic">{t.heroTitleGold}</span></h1>
              <HeroTextSlider slides={t.heroSlider} />
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-lg lg:max-w-none items-center lg:items-start">
                <button onClick={() => nextStep('SIMULATION')} className="gold-gradient w-full lg:w-auto lg:px-16 py-7 rounded-3xl text-black font-black text-base md:text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center">{t.heroBtnStart} <ChevronRight className="inline ml-2" size={28} /></button>
                <button onClick={() => nextStep('REGISTRATION')} className="w-full py-7 rounded-3xl bg-[#d4af37] border border-[#f4d27a]/70 text-black font-black text-base md:text-xl uppercase tracking-widest shadow-2xl shadow-[#d4af37]/35 hover:brightness-110 active:scale-[0.99] transition-all">
                  {t.menuRegistration}
                </button>
              </div>
              <div className="hidden lg:flex gap-16 mt-24 opacity-60">
                <div className="flex items-center gap-4"><ShieldCheck size={30} className="text-[#d4af37]" /><span className="text-[10px] font-mono font-black uppercase tracking-widest text-white">{t.heroCompliance[0]}</span></div>
                <div className="flex items-center gap-4"><Award size={30} className="text-[#d4af37]" /><span className="text-[10px] font-mono font-black uppercase tracking-widest text-white">{t.heroCompliance[1]}</span></div>
                <div className="flex items-center gap-4"><Layers size={30} className="text-[#d4af37]" /><span className="text-[10px] font-mono font-black uppercase tracking-widest text-white">{t.heroCompliance[2]}</span></div>
              </div>
            </div>
            <div className="relative group lg:mt-0 mt-8 md:mt-12 w-full max-w-2xl mx-auto">
              <div className="glass-card rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 border-white/[0.08] relative overflow-hidden group shadow-2xl">
                 <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col">
                      <span className="text-[#d4af37] text-[10px] font-mono font-black uppercase tracking-widest mb-2">{t.heroCardValuation}</span>
                      <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">${Math.round(currentPrice * 600 * 32.1507).toLocaleString()}</span>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"><Gem className="text-[#d4af37]" size={32} /></div>
                 </div>
                 <p className="text-white/40 text-sm md:text-base leading-relaxed mb-12">{t.heroCardDesc}</p>
                 <button onClick={() => nextStep('SIMULATION')} className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37] transition-all flex items-center justify-center gap-3">{t.heroCardMore} <ArrowRight size={18} /></button>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 gold-gradient rounded-full blur-[80px] opacity-20" />
            </div>
          </div>
        )}

        {step === 'SIMULATION' && (
          <div className="w-full max-w-7xl mx-auto animate-in slide-in-from-right duration-700 flex flex-col items-stretch min-h-[calc(100dvh-8rem)] md:min-h-0 px-0 md:px-6 lg:px-0">
            <div className="hidden lg:block text-center mb-20 px-4 md:px-0">
               <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-white mb-8 tracking-tight break-words">{t.calcTitle} <span className="text-gold italic">{t.calcTitleGold}</span></h2>
               <p className="text-white/40 text-sm md:text-base max-w-3xl mx-auto font-medium break-words">{t.calcDesc}</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-4 md:gap-12 items-stretch w-full px-4 md:px-4 lg:px-0">
              <div className="lg:col-span-7 order-1 lg:order-1">
                <div className="glass-card rounded-xl md:rounded-[3.5rem] h-full flex flex-col border-white/[0.08] relative overflow-hidden group shadow-2xl min-h-[400px] md:min-h-[600px]">
                  <div className="absolute inset-0 z-0">
                    <img src={companyCards[currentCard].image} className="w-full h-full object-cover transition-opacity duration-1000 opacity-40 group-hover:scale-105 transition-transform duration-[4s]" alt="Context" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/90 to-transparent"></div>
                  </div>
                  <div className="relative z-10 flex flex-col h-full p-8 md:p-16">
                    <div className="flex flex-col items-center text-center gap-4 md:gap-6 mb-auto">
                      <div className="w-14 h-14 md:w-16 md:h-16 gold-gradient rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                        {React.cloneElement(companyCards[currentCard].icon as React.ReactElement, { className: "text-black" })}
                      </div>
                      <div className="max-w-full">
                        <h3 className="text-lg md:text-4xl font-['Playfair_Display'] font-black text-white uppercase tracking-tight break-words">Imperial Pure Gold</h3>
                        <p className="text-[#d4af37] text-[10px] font-mono font-black uppercase tracking-widest">Institutional Standard</p>
                      </div>
                    </div>
                    <div className="mt-8 md:mt-12 mb-12 md:mb-16 space-y-8 md:space-y-12 relative text-center">
                      <h4 className="text-2xl md:text-5xl font-['Playfair_Display'] font-black text-white leading-tight mb-6 md:mb-8 break-words">{companyCards[currentCard].title}</h4>
                      <AnimatedParagraphs keyId={`${lang}-${currentCard}`} paragraphs={companyCards[currentCard].paragraphs} />
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex gap-3">
                        {companyCards.map((_, i) => (
                          <button key={i} onClick={() => setCurrentCard(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentCard ? 'w-12 bg-[#d4af37]' : 'w-2 bg-white/20'}`} />
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setCurrentCard(prev => (prev - 1 + companyCards.length) % companyCards.length)} className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"><ChevronLeft size={24} /></button>
                        <button onClick={() => setCurrentCard(prev => (prev + 1) % companyCards.length)} className="w-12 h-12 rounded-xl border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"><ChevronRight size={24} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-5 order-2 lg:order-2 flex flex-col">
                <div className="glass-card rounded-xl md:rounded-[3.5rem] p-6 md:p-12 border-white/[0.08] flex flex-col h-full shadow-2xl">
                   <div className="mb-8">
                      <button onClick={openRegistrationGeneric} className="gold-gradient w-full py-7 rounded-[2rem] text-black font-black text-xs md:text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center group">
                        {t.calcBtnActivate} <ChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={24} />
                      </button>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group/item hover:bg-white/[0.08] transition-colors min-h-[140px]">
                        <div className="mb-3 text-[#d4af37]"><CalendarDays size={32} /></div>
                        <div className="font-times">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">{t.calcLabelDelivery}</span>
                          <span className="text-lg md:text-xl font-black text-white leading-none block">№{nextDelivery.id}</span>
                          <span className="text-sm md:text-base font-black text-[#d4af37] uppercase tracking-widest">{lang === 'RU' ? nextDelivery.labelRu.split(',')[0] : nextDelivery.labelEn.split(',')[0]}</span>
                        </div>
                      </div>
                      <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group/item hover:bg-[#d4af37]/10 transition-colors min-h-[140px]">
                        <div className="mb-3 text-[#d4af37]"><RefreshCw size={32} /></div>
                        <div className="font-times">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">{t.calcLabelCycles}</span>
                          <span className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">{remainingCycles}</span>
                        </div>
                      </div>
                   </div>

                   <div className="mt-auto">
                      <div className="flex flex-col gap-4">
                        <button onClick={() => window.open('https://t.me/GoldenShareClub', '_blank')} className="bg-white/5 border border-white/10 w-full py-6 rounded-3xl text-white/40 font-black text-[10px] font-times uppercase tracking-widest flex flex-col items-center justify-center gap-2 hover:text-white transition-all group"><div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-colors"><Send size={16} className="text-[#d4af37]" /></div><span>{t.calcBtnTelegram}</span></button>
                        <button onClick={() => window.open('https://www.facebook.com/share/1Dox5wK2MT/', '_blank')} className="bg-white/5 border border-white/10 w-full py-6 rounded-3xl text-white/40 font-black text-[10px] font-times uppercase tracking-widest flex flex-col items-center justify-center gap-2 hover:text-white transition-all group"><div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-colors"><Facebook size={16} className="text-[#d4af37]" /></div><span>{t.calcBtnFacebook}</span></button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'REGISTRATION' && (
           <div ref={registrationRef} className="w-full max-w-6xl mx-auto flex flex-col min-h-[100dvh] md:min-h-0 md:h-auto md:flex-1 py-0 md:py-8 px-0 md:px-6 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
                <RegistrationForm
                  lang={lang}
                  t={t}
                  lockedAmount={lockedAmount}
                  resolveApiBase={resolveApiBase}
                  resolveLocalBase={resolveLocalBase}
                  buildLoginUrl={buildLoginUrl}
                  onBack={() => nextStep('SIMULATION')}
                  envDashboard={(import.meta as any).env?.VITE_DASHBOARD_APP_URL as string | undefined}
                  onOfferModalVisibilityChange={setIsOfferModalOpen}
                />
              </div>
            </div>
        )}

        {step === 'SUCCESS' && (
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 mt-8 md:mt-20 text-center px-4 md:px-4 overflow-hidden min-h-[calc(100dvh-8rem)] md:min-h-0">
            <div className="w-40 h-40 md:w-48 md:h-48 bg-green-500/15 rounded-full flex items-center justify-center mb-16 border border-green-500/30 relative">
              <Check className="text-green-500" size={80} strokeWidth={3} />
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-[#d4af37] text-black font-black px-4 py-2 md:px-5 md:py-3 rounded-2xl text-[10px] md:text-xs uppercase tracking-widest animate-bounce">{t.successBadge}</div>
            </div>
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-white mb-8 tracking-tight break-words px-4 md:px-2 max-w-full">{t.successTitle}</h2>
            <p className="text-sm md:text-base font-medium text-white/40 mb-16 max-w-3xl break-words px-4 md:px-2">{t.successDesc}</p>
            <div className="grid md:grid-cols-2 gap-10 w-full max-w-4xl px-4 md:px-0">
               <div className="glass-card p-10 md:p-12 rounded-[3.5rem] flex flex-col items-center gap-4 border-white/[0.08]"><span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/30">{t.successLabelTarget}</span><span className="text-2xl md:text-4xl font-black text-white tracking-tighter">${finalAmount.toLocaleString()}</span></div>
               <div className="glass-card p-10 md:p-12 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 border-[#d4af37]/25">
                 <button
                   onClick={() => window.location.href = buildLoginUrl()}
                   className="gold-gradient w-full py-7 rounded-[2rem] text-black font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-3"
                 >
                   {t.successBtnDashboard} <ArrowRight size={22} />
                 </button>
                 <button onClick={() => nextStep('HERO')} className="text-white/40 font-bold uppercase tracking-widest text-[11px]">{t.successBtnBack}</button>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER - контакты */}
      <footer className="bg-[#0a0a0a] text-white pt-5 pb-4 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#d4af37] text-center md:text-left">
                Официальные каналы
              </h4>
              <a href="https://www.facebook.com/share/1Dox5wK2MT/" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white/80 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all">
                <Facebook size={14} />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Официальный Facebook</span>
              </a>
              <a href="https://t.me/GoldenShareClub" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white/80 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all">
                <Send size={14} />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Официальный Telegram</span>
              </a>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#d4af37] text-center md:text-right">
                Контакты менеджера
              </h4>
              <a href="https://t.me/IPG_Mark" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white/80 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all">
                <Send size={14} />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Telegram</span>
              </a>
              <a href="https://api.whatsapp.com/send/?phone=447776177435&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white/80 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all">
                <MessageCircle size={14} />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Whatsapp</span>
              </a>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 gold-gradient rounded flex items-center justify-center shadow-lg"><Gem className="text-black" size={8} /></div>
              <span className="font-playfair font-black text-[10px] uppercase tracking-tight text-white/40">Imperial Pure Gold</span>
            </div>
            <p className="text-[10px] font-mono text-white/20 font-medium tracking-widest text-center md:text-right">© {new Date().getFullYear()} IPG DMCC. {t.rights.toUpperCase()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
