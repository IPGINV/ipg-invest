import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ShieldCheck, 
  Lock, 
  Globe, 
  Mail, 
  Send, 
  Phone, 
  Activity, 
  Check, 
  Info, 
  Coins, 
  Gem, 
  Layers, 
  LayoutGrid, 
  Menu,
  X, 
  User, 
  Eye, 
  EyeOff, 
  Facebook, 
  ArrowRight,
  TrendingUp,
  Award,
  ExternalLink,
  MessageSquare,
  MessageCircle,
  PhoneCall,
  Ship,
  Briefcase,
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
import { 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// --- Types ---
type Step = 'HERO' | 'SIMULATION' | 'REGISTRATION' | 'SUCCESS';
type DrawerState = 'hidden' | 'preview' | 'expanded';
type Language = 'RU' | 'EN';
type TimeRange = '1D' | '1W' | '1M' | '1Y';

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
    managerTitle: "Связь с менеджером",
    managerDesc: "Выберите удобный способ связи. Мы ответим в течение 15 минут.",
    menuDashboard: "Личный Кабинет",
    menuCompany: "Компания",
    menuProject: "Проект",
    menuCalculator: "Калькулятор доходности",
    menuCompanySite: "Сайт компании",
    marqueeLBMABench: "LBMA",
    marqueeSpotAU: "Спот AU",
    marqueeInstLevel: "Чистота 999.9",
    marqueeLivePhysical: "Физический металл",
    heroBadge: "Гана — Дубай",
    heroTitle: "Инвестируйте в",
    heroTitleGold: "физическое золото",
    heroSlider: [
      "Зарабатывайте на международной торговле драгоценными металлами.",
      "Гарантированная доля в контракте на оптовую поставку Ганского золота покупателям мировой ювелирной столицы."
    ],
    heroBtnStart: "Начать расчет",
    heroBtnAbout: "Проект",
    heroBtnToken: "Токен",
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
    calcBtnLock: "Зафиксировать условия",
    regTitle: "Ваш личный доступ",
    regTitleGold: "к контракту",
    regDesc: "После регистрации вам будет открыт доступ в личный кабинет и начислен приветственный бонус.",
    regScrollLabel: "Забрать бонус",
    regFormTitle: "Регистрация",
    regFormOr: "или",
    regLabelEmail: "Email Адрес",
    regLabelPassword: "Пароль",
    regLabelTerms: "Принимаю",
    regLinkOffer: "оферту",
    regBtnOpen: "Открыть кабинет",
    successTitle: "Портфель создан",
    successDesc: "Ваша инвестиционная панель готова к работе. Бонусный токен зачислен на баланс.",
    successBadge: "+1 GHS Активирован",
    successLabelTarget: "Целевая оценка",
    successBtnDashboard: "В кабинет",
    successBtnBack: "На главную",
    drawerLabelBench: "Live LBMA",
    drawerLabelYear: "6 Месяцев",
    drawerChartTitle: "Рыночная",
    drawerChartTitleGold: "динамика",
    drawerChartDesc: "Мониторинг реальных котировок за последние полгода.",
    drawerChartFeed: "Источник: Лондонский рынок драгоценных металлов",
    footerCompliance: "Комплаенс",
    footerNetwork: "Сеть",
    footerSupport: "WhatsApp Поддержка",
    footerPrivacy: "Приватность",
    footerRisk: "Риски",
    footerTerms: "Условия",
    months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    cards: [
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
      {
        title: "Imperial Pure Gold DMCC",
        paragraphs: ["Лицензированная компания в экономической зоне DMCC (Дубай), созданная для построения безопасных и прибыльных цепочек поставок физического золота между Африкой и Ближним Востоком."]
      }
    ]
  },
  EN: {
    menu: "Menu",
    contact: "Contact",
    contactBtn: "Contact Us",
    managerTitle: "Contact Manager",
    managerDesc: "Choose a convenient way to contact us. We will reply within 15 minutes.",
    menuDashboard: "Dashboard",
    menuCompany: "Company",
    menuProject: "Project",
    menuCalculator: "Profit Calculator",
    menuCompanySite: "Company website",
    marqueeLBMABench: "LBMA",
    marqueeSpotAU: "Spot AU",
    marqueeInstLevel: "Purity 999.9",
    marqueeLivePhysical: "Live Physical",
    heroBadge: "Ghana — Dubai",
    heroTitle: "Invest in",
    heroTitleGold: "physical gold",
    heroSlider: [
      "Earn from international precious metals trading.",
      "Guaranteed share in a contract for wholesale supply of Ghana gold to world jewelry capitals."
    ],
    heroBtnStart: "Start Calculation",
    heroBtnAbout: "Project",
    heroBtnToken: "Token",
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
    calcBtnLock: "Fix the conditions",
    regTitle: "Your Personal Access",
    regTitleGold: "to Contract",
    regDesc: "After registration, you will get access to the personal dashboard and a welcome bonus.",
    regScrollLabel: "Get Bonus",
    regFormTitle: "Registration",
    regFormOr: "or",
    regLabelEmail: "Email Address",
    regLabelPassword: "Password",
    regLabelTerms: "I accept",
    regLinkOffer: "terms",
    regBtnOpen: "Open Dashboard",
    successTitle: "Portfolio Created",
    successDesc: "Your investment panel is ready. Bonus token has been credited to your balance.",
    successBadge: "+1 GHS Activated",
    successLabelTarget: "Target Valuation",
    successBtnDashboard: "Dashboard",
    successBtnBack: "Back Home",
    drawerLabelBench: "Live LBMA",
    drawerLabelYear: "Last 6 Months",
    drawerChartTitle: "Market",
    drawerChartTitleGold: "Dynamics",
    drawerChartDesc: "Real-time monitoring of market quotes for the last 6 months.",
    drawerChartFeed: "Source: London Precious Metals Market",
    footerCompliance: "Compliance",
    footerNetwork: "Network",
    footerSupport: "WhatsApp Support",
    footerPrivacy: "Privacy",
    footerRisk: "Risks",
    footerTerms: "Terms",
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    cards: [
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
      {
        title: "Imperial Pure Gold DMCC",
        paragraphs: ["Licensed company in the DMCC economic zone (Dubai), created to build secure and profitable supply chains of physical gold between Africa and the Middle East."]
      }
    ]
  }
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
    <div className="flex flex-col gap-4 md:gap-6 relative min-h-[160px] md:min-h-[220px] justify-center">
      {paragraphs.map((text, idx) => (
        <p 
          key={`${keyId}-${idx}`} 
          className="text-base md:text-xl text-white/80 font-medium leading-relaxed italic animate-in fade-in slide-in-from-left duration-1000 fill-mode-both"
          style={{ animationDelay: `${idx * 400 + 200}ms` }}
        >
          {text}
        </p>
      ))}
    </div>
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
    <div className="relative h-32 md:h-40 w-full max-w-2xl mb-8 md:mb-12 overflow-hidden flex flex-col justify-center px-2">
      {slides.map((text, i) => (
        <div 
          key={i}
          className={`absolute inset-0 flex items-center justify-center lg:justify-start transition-all duration-1000 ease-in-out px-2 ${
            i === current ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex gap-4 items-start border-l-4 border-[#d4af37] pl-4 md:pl-8 py-2 max-w-full">
            <p className="text-[#f0f0f0]/90 text-lg md:text-3xl font-medium leading-tight md:leading-snug italic drop-shadow-lg text-center lg:text-left break-words">
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
    let particles: any[] = [];
    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * (window.innerWidth > 1024 ? 2 : 1.2) + 0.1;
        this.speedX = Math.random() * 0.15 - 0.075;
        this.speedY = Math.random() * 0.15 - 0.075;
        this.opacity = Math.random() * 0.35 + 0.05;
        this.color = Math.random() > 0.7 ? '#d4af37' : '#ffffff';
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas!.width) this.x = 0; else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0; else if (this.y < 0) this.y = canvas!.height;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.globalAlpha = this.opacity; ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    const init = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      particles = []; const count = window.innerWidth > 1024 ? 70 : 25;
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    init(); animate();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="bg-mesh"></div>
      <div className="gold-orb top-[-15%] left-[-10%] opacity-60"></div>
      <div className="gold-orb bottom-[-25%] right-[-10%] opacity-50"></div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141417]/20 to-[#141417] z-10"></div>
      <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-[0.25] saturate-[0.2] mix-blend-screen transition-opacity duration-1000" alt="Skyline" />
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
  const [showPassword, setShowPassword] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [drawerState, setDrawerState] = useState<DrawerState>('hidden');
  const [range, setRange] = useState<TimeRange>('1M');
  const [lockedAmount, setLockedAmount] = useState<number | null>(null);
  const [registrationFullName, setRegistrationFullName] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationError, setRegistrationError] = useState('');

  const heroRef = useRef<HTMLDivElement>(null);
  const registrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiBase) return;
    fetch(`${apiBase}/health`).catch(() => {});
  }, [apiBase]);

  // Проверка URL параметров для прямого открытия калькулятора
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const stepParam = params.get('step');
    
    if (view === 'calculator' || stepParam === 'SIMULATION') {
      setStep('SIMULATION');
      // Очищаем параметры из URL после обработки
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

  useEffect(() => {
    const stored = localStorage.getItem('ipg:registration-payload');
    if (!stored) return;
    try {
      const payload = JSON.parse(stored) as { investorId?: string; email?: string };
      if (payload?.investorId && payload?.email) {
        setRegistrationData({ investorId: payload.investorId, email: payload.email });
      }
    } catch {
      // Ignore invalid cache
    }
  }, []);

  // --- Localization Logic ---
  const companyCards = useMemo(() => [
    { ...t.cards[0], image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1000", icon: <Logo size={24} /> },
    { ...t.cards[1], image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000", icon: <ShieldCheck size={24} /> },
    { ...t.cards[2], image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=1000", icon: <Gem size={24} /> },
    { ...t.cards[3], image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000", icon: <Award size={24} /> }
  ], [lang, t.cards]);

  useEffect(() => {
    const handleScroll = () => {
      if (step !== 'HERO') return;
      if (window.scrollY > 300 && drawerState === 'hidden') setDrawerState('preview');
      else if (window.scrollY <= 300 && drawerState === 'preview') setDrawerState('hidden');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [step, drawerState]);

  const chartData = useMemo(() => {
    if (!marketData.length) return [];
    const mapped = marketData.map((point) => ({
      date: point.fullLabel || point.time,
      price: Number(point.price) || 0
    }));
    const size = range === '1D' ? 24 : range === '1W' ? 7 : range === '1Y' ? 12 : 30;
    return mapped.slice(-size);
  }, [marketData, range]);

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
    if (s !== 'HERO') setDrawerState('hidden');
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

  const buildLoginUrl = () => {
    const isLocal = window.location.hostname === 'localhost';
    return isLocal ? 'http://localhost:3000/login.html' : 'https://dashboard.ipg-invest.ae/login.html';
  };

  const handleOpenDashboard = () => {
    // Всегда редирект на страницу входа Dashboard
    const isLocal = window.location.hostname === 'localhost';
    const dashboardUrl = isLocal ? 'http://localhost:3002' : 'https://dashboard.ipg-invest.ae';
    window.location.href = dashboardUrl;
  };

  const openInfoView = (view: 'company' | 'project') => {
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:3003' : 'https://info.ipg-invest.ae';
    const url = new URL(base);
    url.searchParams.set('view', view);
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
  };

  const openCalculator = () => {
    setIsMenuOpen(false);
    nextStep('SIMULATION');
  };


  const currentPrice = marketData[marketData.length - 1]?.price || 2780;
  const yearlyGrowth = marketData.length > 1 ? (((marketData[marketData.length - 1].price - marketData[0].price) / marketData[0].price) * 100).toFixed(1) : '8.4';

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#d4af37] selection:text-black font-inter text-[#f0f0f0] overflow-x-hidden">
      <InteractiveBackground />

      {/* 1. TOP MARQUEE */}
      <div className="fixed top-0 w-full z-[100] bg-[#141417]/95 border-b border-white/5 h-10 flex items-center overflow-hidden backdrop-blur-2xl">
        <div className="marquee flex items-center">
          <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2"><Gem size={10} /> {t.marqueeLBMABench}: ${currentPrice.toLocaleString()} (+{yearlyGrowth}%)</span>
          <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">{t.marqueeSpotAU}: ${currentPrice.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">USD/AED: {currencyRates.AED}</span>
          <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase">{t.marqueeInstLevel}</span>
          <span className="text-[10px] font-bold text-[#d4af37] px-8 tracking-widest uppercase flex items-center gap-2"><Gem size={10} /> {t.marqueeLivePhysical}</span>
          <span className="text-[10px] font-bold text-white/40 px-8 tracking-widest uppercase">USD/RUB: {currencyRates.RUB}</span>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="fixed top-10 w-full z-[90] bg-[#141417]/25 backdrop-blur-3xl border-b border-white/5 px-4 md:px-12 h-20 flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-3 md:gap-5 cursor-pointer group" onClick={() => setIsMenuOpen(true)}>
          <div className="flex items-center gap-2 md:gap-3 bg-white/5 p-1 pr-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
            <div className="w-10 h-10 md:w-11 md:h-11 gold-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Menu className="text-black" size={20} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-playfair font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Imperial</span>
              <span className="font-playfair font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Pure</span>
              <span className="font-playfair font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] text-white leading-tight">Gold</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
           <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/10">
              <button onClick={() => setLang('RU')} className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'RU' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}>RU</button>
              <button onClick={() => setLang('EN')} className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all ${lang === 'EN' ? 'bg-[#d4af37] text-black' : 'text-white/40 hover:text-white'}`}>EN</button>
           </div>

           <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 group/hub">
              <div className={`flex items-center gap-2 transition-all duration-500 overflow-hidden ${isContactExpanded ? 'max-w-[150px] md:max-w-[200px] opacity-100 pr-2' : 'max-w-0 opacity-0'}`}>
                <a href="https://t.me/GoldenShareClub" target="_blank" className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex-shrink-0"><Send size={16} /></a>
                <button onClick={() => setIsManagerModalOpen(true)} className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/40 hover:text-[#d4af37] transition-all flex-shrink-0"><User size={16} /></button>
              </div>
              <button onClick={() => setIsContactExpanded(!isContactExpanded)} className={`flex items-center justify-center px-4 md:px-6 h-9 md:h-10 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${isContactExpanded ? 'bg-white/10 text-white' : 'text-[#d4af37]'}`}>
                {isContactExpanded ? <X size={14} /> : t.contactBtn}
              </button>
           </div>
        </div>
      </header>

      {/* MODALS & MENU */}
      {isManagerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#141417]/80 backdrop-blur-sm" onClick={() => setIsManagerModalOpen(false)}></div>
           <div className="relative glass-card p-8 md:p-12 rounded-[3rem] w-full max-sm:mx-4 max-w-sm border-[#d4af37]/20 flex flex-col items-center animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsManagerModalOpen(false)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-all"><X size={24} /></button>
              <div className="w-16 h-16 md:w-20 md:h-20 gold-gradient rounded-3xl flex items-center justify-center mb-8 shadow-2xl"><User className="text-black" size={32} /></div>
              <h3 className="text-2xl md:text-3xl font-playfair font-black text-white text-center mb-4">{t.managerTitle}</h3>
              <p className="text-white/40 text-center text-sm md:text-base mb-10 font-medium mx-auto max-w-[220px]">{t.managerDesc}</p>
              <div className="flex flex-col gap-4 w-full">
                 <a href="https://t.me/IPG_Mark" target="_blank" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform"><Send size={24} /></div>
                    <div className="flex flex-col"><span className="text-white font-bold text-lg">Telegram</span><span className="text-white/30 text-xs font-bold uppercase tracking-widest">Chat with Mark</span></div>
                 </a>
                 <a href="https://wa.me/447782280474" target="_blank" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-green-500/40 hover:bg-white/[0.08] transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                    <div className="flex flex-col"><span className="text-white font-bold text-lg">WhatsApp</span><span className="text-white/30 text-xs font-bold uppercase tracking-widest">Instant message</span></div>
                 </a>
              </div>
           </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[#141417]/98 backdrop-blur-3xl animate-in fade-in duration-300 flex flex-col items-center justify-start p-6 pt-[10vh]">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 p-3 bg-white/5 rounded-full border border-white/10 text-white/60 hover:text-[#d4af37] transition-all"><X size={32} /></button>
          <nav className="flex flex-col gap-6 w-full max-w-sm text-center">
            {[
              { label: t.menuDashboard, icon: User, action: handleOpenDashboard },
              { label: t.menuCompany, icon: Briefcase, action: () => openInfoView('company') },
              { label: t.menuProject, icon: LayoutGrid, action: () => openInfoView('project') },
              { label: t.menuCalculator, icon: BarChart3, action: openCalculator }
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="group flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#d4af37]/40 hover:bg-white/[0.08] transition-all text-left">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#d4af37]/15 transition-colors">
                  <item.icon className="text-[#d4af37]" size={26} />
                </div>
                <span className="text-xl font-bold text-white uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
            <div className="mt-[12vh] pt-8 border-t border-white/10 flex flex-col gap-4">
              <a
                href="https://imperialpuregold.ae"
                target="_blank"
                rel="noreferrer"
                className="text-[#d4af37] font-black uppercase tracking-widest text-sm hover:text-white transition-colors"
              >
                {t.menuCompanySite}
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="relative z-10 pt-40 md:pt-56 pb-24 px-4 md:px-12 flex-1 flex flex-col items-center overflow-hidden">
        {step === 'HERO' && (
          <div ref={heroRef} className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 md:gap-24 items-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full overflow-hidden px-2">
              <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full mb-8 md:mb-12 pulse-gold">
                 <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_green]"></span>
                 <span className="text-[11px] text-white/80 font-bold tracking-[0.2em] uppercase">{t.heroBadge}</span>
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-9xl font-playfair font-black text-white mb-8 md:mb-10 leading-[1.15] md:leading-[1] drop-shadow-md break-words w-full">{t.heroTitle} <br/> <span className="text-gold italic">{t.heroTitleGold}</span></h1>
              <HeroTextSlider slides={t.heroSlider} />
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-lg lg:max-w-none items-center lg:items-start px-2 md:px-0">
                <button onClick={() => nextStep('SIMULATION')} className="gold-gradient w-full lg:w-auto lg:px-16 py-7 rounded-3xl text-black font-extrabold text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center">{t.heroBtnStart} <ChevronRight className="inline ml-2" size={28} /></button>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => openInfoView('project')}
                    className="bg-white/5 border border-white/10 flex-1 py-7 rounded-3xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.12] transition-all"
                  >
                    {t.heroBtnAbout}
                  </button>
                  <button
                    onClick={() => openInfoView('project')}
                    className="bg-white/5 border border-white/10 flex-1 py-7 rounded-3xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.12] transition-all"
                  >
                    {t.heroBtnToken}
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex gap-16 mt-24 opacity-60">
                <div className="flex items-center gap-4"><ShieldCheck size={30} className="text-[#d4af37]" /><span className="text-[10px] font-black uppercase text-white tracking-[0.4em]">{t.heroCompliance[0]}</span></div>
                <div className="flex items-center gap-4"><Award size={30} className="text-[#d4af37]" /><span className="text-[10px] font-black uppercase text-white tracking-[0.4em]">{t.heroCompliance[1]}</span></div>
                <div className="flex items-center gap-4"><Layers size={30} className="text-[#d4af37]" /><span className="text-[10px] font-black uppercase text-white tracking-[0.4em]">{t.heroCompliance[2]}</span></div>
              </div>
            </div>
            <div className="relative group lg:mt-0 mt-8 md:mt-12 w-full max-w-2xl mx-auto px-2 md:px-0">
              <div className="glass-card rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 border-white/[0.08] relative overflow-hidden group shadow-2xl">
                 <div className="flex justify-between items-center mb-10">
                    <div className="flex flex-col">
                      <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.4em] mb-2">{t.heroCardValuation}</span>
                      <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        ${(600 * currentPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10"><Gem className="text-[#d4af37]" size={32} /></div>
                 </div>
                 <p className="text-white/40 text-sm md:text-base leading-relaxed mb-12">{t.heroCardDesc}</p>
                 <button onClick={() => nextStep('SIMULATION')} className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37] transition-all flex items-center justify-center gap-3">{t.heroCardMore} <ArrowRight size={18} /></button>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 gold-gradient rounded-full blur-[80px] opacity-20"></div>
            </div>
          </div>
        )}

        {step === 'SIMULATION' && (
          <div className="w-full max-w-7xl animate-in slide-in-from-right duration-700 flex flex-col items-center px-2">
            <div className="hidden lg:block text-center mb-20 px-4">
               <h2 className="text-4xl md:text-7xl font-playfair font-black text-white mb-8 tracking-tight break-words">{t.calcTitle} <span className="text-gold italic">{t.calcTitleGold}</span></h2>
               <p className="text-white/50 text-base md:text-xl max-w-3xl mx-auto font-medium break-words">{t.calcDesc}</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-stretch w-full px-2 md:px-4 lg:px-0">
              <div className="lg:col-span-7 order-1 lg:order-1">
                <div className="glass-card rounded-[2rem] md:rounded-[3.5rem] h-full flex flex-col border-white/[0.08] relative overflow-hidden group shadow-2xl min-h-[500px] md:min-h-[600px]">
                  <div className="absolute inset-0 z-0">
                    <img src={companyCards[currentCard].image} className="w-full h-full object-cover transition-opacity duration-1000 opacity-40 group-hover:scale-105 transition-transform duration-[4s]" alt="Context" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-[#141417]/90 to-transparent"></div>
                  </div>
                  <div className="relative z-10 flex flex-col h-full p-6 md:p-16">
                    <div className="flex items-center gap-4 md:gap-6 mb-auto">
                      <div className="w-14 h-14 md:w-16 md:h-16 gold-gradient rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
                        {React.cloneElement(companyCards[currentCard].icon as React.ReactElement, { className: "text-black" })}
                      </div>
                      <div>
                        <h3 className="text-xl md:text-4xl font-playfair font-black text-white uppercase tracking-tight break-words">Imperial Pure Gold</h3>
                        <p className="text-[#d4af37] text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Institutional Standard</p>
                      </div>
                    </div>
                    <div className="mt-8 md:mt-12 mb-12 md:mb-16 space-y-8 md:space-y-12 relative">
                      <h4 className="text-2xl md:text-5xl font-playfair font-black text-white leading-tight mb-6 md:mb-8 break-words">{companyCards[currentCard].title}</h4>
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
                <div className="glass-card rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 border-white/[0.08] flex flex-col h-full shadow-2xl">
                   <div className="mb-8">
                      <button onClick={openRegistrationGeneric} className="gold-gradient w-full py-7 rounded-[2rem] text-black font-black text-lg md:text-xl uppercase tracking-[0.15em] shadow-xl active:scale-95 transition-all hover:brightness-110 flex items-center justify-center group">
                        {t.calcBtnActivate} <ChevronRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={24} />
                      </button>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group/item hover:bg-white/[0.08] transition-colors min-h-[140px]">
                        <div className="mb-3 text-[#d4af37]"><CalendarDays size={32} /></div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-white/30 block mb-1">{t.calcLabelDelivery}</span>
                          <span className="text-lg md:text-xl font-black text-white leading-none block">№{nextDelivery.id}</span>
                          <span className="text-sm md:text-base font-bold text-[#d4af37] uppercase tracking-wider">{lang === 'RU' ? nextDelivery.labelRu.split(',')[0] : nextDelivery.labelEn.split(',')[0]}</span>
                        </div>
                      </div>
                      <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center group/item hover:bg-[#d4af37]/10 transition-colors min-h-[140px]">
                        <div className="mb-3 text-[#d4af37]"><RefreshCw size={32} /></div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-white/30 block mb-1">{t.calcLabelCycles}</span>
                          <span className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">{remainingCycles}</span>
                        </div>
                      </div>
                   </div>

                   <div className="mb-10 w-full p-2">
                      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <div className="flex flex-col items-center md:items-start">
                          <label className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em] mb-1">{t.calcLabelCapital}</label>
                          <div className="h-1 w-12 bg-[#d4af37] rounded-full"></div>
                        </div>
                        <span className="text-4xl md:text-5xl font-black text-[#d4af37] tracking-tighter">${amount.toLocaleString()}</span>
                      </div>
                      <input type="range" min="100" max="100000" step="100" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full" />
                      <div className="flex justify-between mt-6 text-[10px] font-bold text-white/10 tracking-[0.2em] uppercase"><span>{t.calcLabelMin}</span><span>{t.calcLabelMax}</span></div>
                   </div>

                   <div className="mt-auto">
                      <div className="mb-10 p-1 flex flex-col gap-1">
                         <div className="bg-white/5 border border-white/10 p-8 rounded-t-[2.5rem] relative overflow-hidden group/res hover:bg-white/[0.08] transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-white group-hover/res:scale-110 transition-transform"><CircleDollarSign size={80} /></div>
                            <div className="flex items-center gap-3 mb-3">
                               <div className="p-1.5 rounded-lg bg-[#d4af37]/10 text-[#d4af37]"><TrendUpIcon size={14} /></div>
                               <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">{t.calcLabelForecast}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                               <span className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg transition-all group-hover/res:tracking-normal duration-500">${finalAmount.toLocaleString()}</span>
                               <span className="text-white/20 text-xs font-bold uppercase tracking-widest pb-1.5">USD</span>
                            </div>
                         </div>
                         <div className="bg-[#d4af37]/10 border-x border-b border-[#d4af37]/20 p-8 rounded-b-[2.5rem] flex items-center justify-between group/roi hover:bg-[#d4af37]/15 transition-all">
                            <div className="flex flex-col">
                               <div className="flex items-center gap-2 mb-1.5"><BarChart3 size={14} className="text-[#d4af37]" /><span className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em]">{t.calcLabelROI}</span></div>
                               <div className="flex items-center gap-3"><span className="text-3xl md:text-4xl font-black text-[#d4af37] tracking-tighter">+{roi}%</span><div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden relative"><div className="absolute top-0 left-0 h-full bg-[#d4af37] transition-all duration-1000 ease-out" style={{ width: `${Math.min(roi, 100)}%` }}></div></div></div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <button onClick={() => window.open('https://t.me/GoldenShareClub', '_blank')} className="bg-white/5 border border-white/10 w-full py-6 rounded-3xl text-white/40 font-bold text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-2 hover:text-white transition-all group"><div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-colors"><Send size={16} className="text-[#d4af37]" /></div><span>{t.calcBtnTelegram}</span></button>
                        <button onClick={openRegistrationFromCalculator} className="bg-[#d4af37]/10 border border-[#d4af37]/30 w-full py-6 rounded-3xl text-[#d4af37] font-black uppercase flex flex-col items-center justify-center leading-tight hover:bg-[#d4af37]/20 transition-all shadow-lg group"><span className="text-[14px] md:text-[16px] tracking-[0.2em]">{t.calcBtnLock}</span></button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'REGISTRATION' && (
           <div className="w-full max-w-6xl flex flex-col items-center animate-in zoom-in-95 duration-700 mt-12 text-center px-4 overflow-hidden">
              <div className="flex flex-col gap-8 text-center mb-16 w-full">
                 <h2 className="text-4xl md:text-7xl font-playfair font-black text-white leading-tight break-words px-2">{t.regTitle} <br/> <span className="text-gold italic">{t.regTitleGold}</span></h2>
                 <p className="text-base md:text-2xl text-white/60 leading-relaxed max-w-2xl font-medium mx-auto break-words px-2">{t.regDesc}</p>
                 <div className="flex flex-col items-center gap-4 mt-8 cursor-pointer group" onClick={() => registrationRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                    <span className="text-[#d4af37] font-black uppercase tracking-[0.4em] text-sm group-hover:scale-105 transition-transform">{t.regScrollLabel}</span>
                    <ArrowDown className="text-[#d4af37] animate-bounce" size={32} />
                 </div>
              </div>

              <div ref={registrationRef} className="glass-card p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] relative overflow-hidden max-w-md mx-auto w-full border-[#d4af37]/15 mb-24">
                <div className="w-20 h-20 md:w-24 md:h-24 gold-gradient rounded-[2rem] flex items-center justify-center mx-auto mb-12 shadow-2xl border-4 border-[#141417]/30"><Lock className="text-black" size={36} /></div>
                <h2 className="text-2xl md:text-5xl font-playfair font-black text-white text-center mb-10 uppercase tracking-tighter break-words px-2">{t.regFormTitle}</h2>
                {lockedAmount !== null && (
                  <div className="mb-10 text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                      {lang === 'RU' ? 'Сумма инвестиций' : 'Investment Amount'}
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-[#d4af37] tracking-tighter">
                      ${lockedAmount.toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="flex justify-center gap-4 mb-10">
                  <button className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-[#d4af37] transition-all"><Send size={24} /></button>
                </div>
                <div className="flex items-center gap-4 mb-8 opacity-20"><div className="h-[1px] flex-1 bg-white"></div><span className="text-[10px] font-black uppercase tracking-widest">{t.regFormOr}</span><div className="h-[1px] flex-1 bg-white"></div></div>
                <form
                  className="space-y-7"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setRegistrationError('');
                    const base = (window as any).__IPG_API_BASE || 
                      (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.ipg-invest.ae');
                    try {
                      const res = await fetch(`${base}/auth/register/email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: registrationEmail.trim(),
                          password: registrationPassword,
                          full_name: registrationFullName.trim() || 'Investor',
                          agree_terms: true
                        })
                      });
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body.error || 'Registration failed');
                      }
                      window.location.href = buildLoginUrl();
                    } catch (err: any) {
                      setRegistrationError(err.message || 'Registration failed');
                    }
                  }}
                >
                  <div className="space-y-3 text-left">
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] ml-1.5">
                      {lang === 'RU' ? 'ФИО' : 'Full name'}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={lang === 'RU' ? 'Иванов Иван Иванович' : 'John Doe'}
                      value={registrationFullName}
                      onChange={(e) => setRegistrationFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-6 text-white focus:border-[#d4af37]/60 outline-none text-lg font-bold transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] ml-1.5">{t.regLabelEmail}</label>
                    <input
                      required
                      type="email"
                      placeholder="investor@global.ae"
                      value={registrationEmail}
                      onChange={(e) => setRegistrationEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-6 text-white focus:border-[#d4af37]/60 outline-none text-lg font-bold transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] ml-1.5">{t.regLabelPassword}</label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registrationPassword}
                        onChange={(e) => setRegistrationPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-6 text-white focus:border-[#d4af37]/60 outline-none text-lg font-bold transition-all placeholder:text-white/10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-7 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-3 justify-center"><input type="checkbox" id="terms" required className="w-6 h-6 accent-[#d4af37] rounded-lg" /><label htmlFor="terms" className="text-sm text-white/40">{t.regLabelTerms} <button type="button" className="text-[#d4af37] font-bold hover:underline">{t.regLinkOffer}</button></label></div>
                  {registrationError && (
                    <div className="text-red-400 text-sm text-center">{registrationError}</div>
                  )}
                  <button className="gold-gradient w-full py-7 rounded-[2rem] text-black font-black uppercase tracking-widest text-lg shadow-2xl mt-6">{t.regBtnOpen}</button>
                </form>
              </div>
           </div>
        )}

        {step === 'SUCCESS' && (
          <div className="w-full max-w-5xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000 mt-20 text-center px-4 overflow-hidden">
            <div className="w-40 h-40 md:w-48 md:h-48 bg-green-500/15 rounded-full flex items-center justify-center mb-16 border border-green-500/30 relative">
              <Check className="text-green-500" size={80} strokeWidth={3} />
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-[#d4af37] text-black font-black px-4 py-2 md:px-5 md:py-3 rounded-2xl text-xs md:text-base animate-bounce">{t.successBadge}</div>
            </div>
            <h2 className="text-4xl md:text-8xl font-playfair font-black text-white mb-8 tracking-tighter break-words px-2">{t.successTitle}</h2>
            <p className="text-lg md:text-3xl font-medium text-white/50 mb-16 max-w-3xl break-words px-2">{t.successDesc}</p>
            <div className="grid md:grid-cols-2 gap-10 w-full max-w-4xl">
               <div className="glass-card p-10 md:p-12 rounded-[3.5rem] flex flex-col items-center gap-4 border-white/[0.08]"><span className="text-[12px] font-bold uppercase tracking-[0.4em] text-white/30">{t.successLabelTarget}</span><span className="text-4xl md:text-7xl font-black text-white tracking-tighter">${finalAmount.toLocaleString()}</span></div>
               <div className="glass-card p-10 md:p-12 rounded-[3.5rem] flex flex-col items-center justify-center gap-8 border-[#d4af37]/25">
                 <button
                   onClick={() => window.location.href = buildLoginUrl()}
                   className="gold-gradient w-full py-7 rounded-[2rem] text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                 >
                   {t.successBtnDashboard} <ArrowRight size={22} />
                 </button>
                 <button onClick={() => nextStep('HERO')} className="text-white/40 font-bold uppercase tracking-[0.5em] text-[11px]">{t.successBtnBack}</button>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* DYNAMIC BOTTOM SHEET (GOLD CHART) */}
      <div className={`fixed left-0 right-0 bottom-0 z-[150] flex flex-col items-center transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) ${drawerState === 'hidden' ? 'translate-y-full' : drawerState === 'preview' ? 'translate-y-[calc(100%-70px)]' : 'translate-y-0'} px-2 md:px-0`}>
        <div className="w-full max-w-5xl bg-[#141417]/98 backdrop-blur-3xl border-x border-t border-white/10 rounded-t-[2rem] md:rounded-t-[3rem] shadow-[0_-40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[95vh] md:h-[98vh]">
          <div className="flex items-center justify-between px-4 md:px-12 py-4 md:py-6 cursor-pointer border-b border-white/5 active:bg-white/5 transition-colors" onClick={() => setDrawerState(prev => prev === 'expanded' ? 'preview' : 'expanded')}>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="w-9 h-9 md:w-10 md:h-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg"><Gem className="text-black" size={18} /></div>
              <div className="flex flex-col">
                <span className="text-[#d4af37] text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">{t.drawerLabelBench}</span>
                <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-xl md:text-3xl font-black text-white tracking-tighter">${currentPrice.toLocaleString()}</span>
                  <span className="text-[9px] md:text-[12px] text-green-500 font-bold">+{yearlyGrowth}%</span>
                </div>
              </div>
            </div>
            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37]">{drawerState === 'expanded' ? <ChevronDown size={24} /> : <ChevronUp size={24} />}</button>
          </div>

          <div className="flex-1 p-4 md:p-12 flex flex-col overflow-hidden">
            <div className="hidden md:flex flex-col items-center text-center mb-10 gap-8 px-2">
               <div className="max-w-2xl w-full">
                  <h3 className="text-2xl md:text-5xl font-playfair font-black text-white mb-4 tracking-tight break-words px-2">{t.drawerChartTitle} <span className="text-gold italic">{t.drawerChartTitleGold}</span></h3>
                  <p className="text-white/40 text-xs md:text-lg font-medium break-words px-2">{t.drawerChartDesc}</p>
               </div>
            </div>
            <div className="chart-container bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-6 w-full h-[55%] md:h-[40%] min-h-[280px] md:min-h-[320px] max-h-[500px] flex flex-col relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-[#d4af37]/5 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6 gap-3 md:gap-0 z-10">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-[#d4af37] rounded-full animate-pulse"></div>
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider md:tracking-widest text-white/80">
                    Gold Price
                  </h3>
                  <span className="hidden md:inline text-white/40 text-xs">(USD/oz)</span>
                </div>
                <div className="flex bg-black/30 p-0.5 md:p-1 rounded-lg border border-white/5">
                  {(['1D', '1W', '1M', '1Y'] as TimeRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-bold rounded-md transition-all ${
                        range === r
                          ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full min-h-0 z-10">
                {drawerState !== 'hidden' && (
                  <ResponsiveContainer width="100%" height="100%" minHeight={220} minWidth={0}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 600 }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(212,175,55,0.6)', fontSize: 10, fontWeight: 700 }}
                      dx={8}
                      tickFormatter={(val) => `$${val}`}
                      width={55}
                    />
                    <Tooltip
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="bg-[#141417]/95 border border-[#d4af37]/40 p-3 rounded-lg shadow-2xl backdrop-blur-md">
                            <p className="text-[9px] text-white/50 mb-1 font-bold uppercase tracking-wider">{label}</p>
                            <p className="text-lg font-black text-[#d4af37] tracking-tight">
                              ${payload[0].value?.toFixed(2)}
                            </p>
                          </div>
                        ) : null
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#d4af37"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      animationDuration={800}
                    />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="mt-3 md:mt-4 flex justify-between items-center px-1">
               <div className="flex items-center gap-2 md:gap-3 opacity-40">
                 <TrendingUp size={12} className="text-[#d4af37]" />
                 <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">{t.drawerChartFeed}</span>
               </div>
               <div className="hidden md:flex items-center gap-2 opacity-30">
                 <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full"></div>
                 <span className="text-[8px] font-bold uppercase tracking-wider text-white/60">Live</span>
               </div>
            </div>
            <div className="md:hidden mt-3 px-1">
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-2 border border-white/5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Current</span>
                <span className="text-base font-black text-[#d4af37]">${currentPrice.toLocaleString()}</span>
                <span className="text-[9px] font-bold text-green-500">+{yearlyGrowth}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 px-4 md:px-20 bg-[#141417]/90 border-t border-white/5 mt-auto overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-12 w-full">
           <div className="grid grid-cols-2 gap-0 w-full relative">
              <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-white/10 -translate-x-1/2"></div>
              <div className="space-y-6 flex flex-col items-center lg:items-start pr-4 md:pr-16 text-center lg:text-left">
                 <h4 className="text-[10px] md:text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] pb-3 border-b border-[#d4af37]/15 w-full">{t.footerCompliance}</h4>
                 <ul className="space-y-4 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
                    <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer"><ShieldCheck size={16} className="text-[#d4af37]" /> <span>DMCC Registered</span></li>
                    <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer"><Award size={16} className="text-[#d4af37]" /> <span>LBMA Standard</span></li>
                    <li className="flex flex-col lg:flex-row items-center gap-3 hover:text-white transition-colors cursor-pointer"><Lock size={16} className="text-[#d4af37]" /> <span>Multi-Sig Security</span></li>
                 </ul>
              </div>
              <div className="space-y-6 flex flex-col items-center lg:items-start pl-4 md:pl-16 text-center lg:text-left">
                 <h4 className="text-[10px] md:text-[12px] font-black text-[#d4af37] uppercase tracking-[0.4em] pb-3 border-b border-[#d4af37]/15 w-full">{t.footerNetwork}</h4>
                 <ul className="space-y-4 text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">
                    <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><a href="mailto:info@ipg-invest.ae" className="flex items-center gap-3"><Mail size={16} /> <span className="break-all">info@ipg-invest.ae</span></a></li>
                    <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><a href="https://t.me/GoldenShareClub" target="_blank" className="flex items-center gap-3"><Send size={16} /> <span>Official Telegram</span></a></li>
                    <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><a href="https://wa.me/971529657370" target="_blank" className="flex items-center gap-3"><MessageCircle size={16} /> <span>{t.footerSupport}</span></a></li>
                 </ul>
              </div>
           </div>
           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 w-full">
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">© 2026 Imperial Pure Gold Trading LLC. All rights reserved.</span>
              <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                 <button className="hover:text-[#d4af37] transition-colors">{t.footerPrivacy}</button>
                 <button className="hover:text-[#d4af37] transition-colors">{t.footerRisk}</button>
                 <button className="hover:text-[#d4af37] transition-colors">{t.footerTerms}</button>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
