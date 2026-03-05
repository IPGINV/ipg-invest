export type Language = 'RU' | 'EN';
export type ViewState = 'company' | 'project';

export interface Translation {
  navCompany: string;
  navProject: string;
  navWallet: string;
  navMainSite: string;
  contactBtn: string;
  marqueeLBMABench: string;
  marqueeSpotAU: string;
  marqueeInstLevel: string;
  marqueeLivePhysical: string;
  companyTitle: string;
  companySubtitle: string;
  companyDescTitle: string;
  companyDescText1: string;
  companyDescText2: string;
  licenseTitle: string;
  licenseDownload: string;
  licenseView: string;
  leadershipTitle: string;
  externalLinkText: string;
  managerTitle: string;
  managerDesc: string;
  managerTelegramSub: string;
  managerWhatsappSub: string;
  menuDashboard: string;
  menuCompany: string;
  menuProject: string;
  menuCalculator: string;
  menuCompanySite: string;
  projectTabAbout: string;
  projectTabToken: string;
  projectTitle: string;
  projectDesc: string;
  telegramBtn: string;
  tokenTitle: string;
  tokenDesc: string;
  tokenFeature1: string;
  tokenFeature2: string;
  tokenFeature3: string;
  walletBtn: string;
  footerCompliance: string;
  footerNetwork: string;
  footerSupport: string;
  footerDesc: string;
  rights: string;
  footerPrivacy: string;
  footerRisk: string;
  footerTerms: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}
