import { Language, ChartDataPoint } from "./types";

export const TRANSLATIONS = {
  EN: {
    marqueeLBMABench: "LBMA BENCHMARK",
    marqueeSpotAU: "SPOT AU",
    marqueeInstLevel: "INSTITUTIONAL GRADE",
    marqueeLivePhysical: "PHYSICAL ASSET",
    contactBtn: "Contact Us",
    menuDashboard: "Dashboard",
    menuCompany: "Company",
    menuProject: "Project",
    menuCalculator: "Profit Calculator",
    menuCompanySite: "Company website",
    signOut: "Sign Out",
    footerCompliance: "Compliance",
    footerNetwork: "Contacts",
    footerSupport: "VIP Support",
    footerDesc: "Imperial Pure Gold DMCC provides access to institutional-grade gold investment vehicles, ensuring flawless liquidity and stable returns in any market conditions.",
    rights: "All Rights Reserved.",
    footerPrivacy: "Privacy",
    footerRisk: "Risks",
    footerTerms: "Terms",
    legalModalClose: "Close",
    // Wallet Specific
    balanceTitle: "Total GHS Balance",
    goldEquiv: "Gold Equivalent",
    walletActions: {
      deposit: "Deposit",
      withdraw: "Withdraw",
      connect: "Connect Wallet",
      disconnect: "Disconnect"
    },
    history: {
      title: "Transaction History",
      colDate: "Date",
      colType: "Type",
      colAmount: "Amount",
      colStatus: "Status",
      colComment: "Comment"
    },
    chart: {
      title: "GHS Token Price"
    }
  },
  RU: {
    marqueeLBMABench: "LBMA БЕНЧМАРК",
    marqueeSpotAU: "SPOT AU",
    marqueeInstLevel: "ИНСТИТУЦИОНАЛЬНЫЙ УРОВЕНЬ",
    marqueeLivePhysical: "ФИЗИЧЕСКИЙ МЕТАЛЛ",
    contactBtn: "Связаться",
    menuDashboard: "Личный кабинет",
    menuCompany: "Компания",
    menuProject: "Проект",
    menuCalculator: "Калькулятор доходности",
    menuCompanySite: "Сайт компании",
    signOut: "Выход",
    footerCompliance: "Комплаенс",
    footerNetwork: "Контакты",
    footerSupport: "VIP Поддержка",
    footerDesc: "Imperial Pure Gold DMCC предоставляет доступ к институциональным инвестиционным инструментам на базе золота, обеспечивая безупречную ликвидность и стабильную доходность в любых рыночных условиях.",
    rights: "Все права защищены.",
    footerPrivacy: "Конфиденциальность",
    footerRisk: "Риски",
    footerTerms: "Условия",
    legalModalClose: "Закрыть",
    // Wallet Specific
    balanceTitle: "Баланс GHS",
    goldEquiv: "Золотой Эквивалент",
    walletActions: {
      deposit: "Пополнить",
      withdraw: "Вывести",
      connect: "Подключить кошелек",
      disconnect: "Отключить"
    },
    history: {
      title: "История транзакций",
      colDate: "Дата",
      colType: "Тип",
      colAmount: "Сумма",
      colStatus: "Статус",
      colComment: "Комментарий"
    },
    chart: {
      title: "Курс токена GHS"
    }
  }
};

export const generateChartData = (range: string): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let points = 30;
  let basePrice = 1850;
  
  if (range === '1D') points = 24;
  if (range === '1W') points = 7;
  if (range === '1M') points = 30;
  if (range === '1Y') points = 12;

  for (let i = 0; i < points; i++) {
    const volatility = Math.random() * 20 - 5; // Slight upward trend
    basePrice += volatility;
    let dateLabel = '';
    
    if (range === '1D') dateLabel = `${i}:00`;
    else if (range === '1Y') dateLabel = `Month ${i+1}`;
    else dateLabel = `Day ${i+1}`;

    data.push({
      date: dateLabel,
      price: parseFloat(basePrice.toFixed(2))
    });
  }
  return data;
};
