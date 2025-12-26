export type VentureType = 'gaming' | 'commerce' | 'dropshipping' | 'inventory';

export interface PaymentConfig {
  stripeActive: boolean;
  paypalActive: boolean;
  testMode: boolean;
  taxProvider: 'avalara' | 'taxjar' | 'native';
  supportedCurrencies: string[];
  fraudProtection: boolean; // Stripe Radar
  subscriptionEnabled: boolean;
}

export interface MarketingConfig {
  klaviyoActive: boolean;
  mailchimpActive: boolean;
  smsMarketing: boolean;
  automationFlows: {
    abandonedCart: boolean;
    postPurchase: boolean;
    winBack: boolean;
  };
  ugcEnabled: boolean;
}

export interface AutomationFlow {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  type: 'flat' | 'free' | 'weight' | 'price';
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface GamingMerchConfig {
  twitchSync: boolean;
  discordWebhooks: string[];
  steamWorkshopId?: string;
  preOrderMode: boolean;
}

export interface GithubArchitectConfig {
  repoUrl: string;
  autoIssueCreation: boolean;
  lastSync?: number;
}

export interface LumoPrivacySettings {
  encryptedComms: boolean;
  pixelFreeAnalytics: boolean;
  gdprStrict: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ventureType: VentureType;
  createdAt: number;
  steps: Step[];
  progress: number;
  feasibilityScore?: number;
  shopifyUrl?: string; 
  language?: string;
  shippingZones?: ShippingZone[];
  integrations?: IntegrationSettings;
  wholesale?: WholesaleConfig[];
  pricing?: PricingConfig;
  gamingConfig?: GamingMerchConfig;
  githubConfig?: GithubArchitectConfig;
  privacy?: LumoPrivacySettings;
  payments?: PaymentConfig;
  marketing?: MarketingConfig;
  automations?: AutomationFlow[];
}

export interface IntegrationConfig {
  isActive: boolean;
  apiKey?: string;
  endpoint?: string;
  databaseId?: string;
  lastSync?: number;
}

export interface IntegrationSettings {
  proton: IntegrationConfig;
  zapier: IntegrationConfig;
  notion: IntegrationConfig;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  estimatedTime?: string;
  category: 'setup' | 'design' | 'marketing' | 'products' | 'settings' | 'research' | 'sourcing' | 'branding' | 'payments' | 'analytics' | 'automation' | 'seo' | 'social' | 'testing' | 'loyalty' | 'inventory' | 'integrations' | 'logistics' | 'wholesale' | 'gaming' | 'workflow';
  deepLink?: string; 
  externalLink?: string; 
}

export interface GeneratedPlanResponse {
  projectName: string;
  projectDescription: string;
  steps: {
    title: string;
    description: string;
    estimatedTime: string;
    category: string;
    deepLink?: string;
    externalLink?: string;
  }[];
  feasibilityScore?: number;
}

export interface StepAdvice {
  stepId: string;
  detailedInstructions: string;
  whyItMatters: string;
  commonPitfalls: string[];
  suggestedAdminPath?: string; 
  suggestedExternalTool?: {
    name: string;
    url: string;
    type: 'canva' | 'figma' | 'aliexpress' | 'printful' | 'stripe' | 'paypal' | 'klaviyo' | 'mailchimp' | 'instagram' | 'tiktok' | 'other';
  };
}

export interface WholesaleConfig {
  provider: 'alibaba' | 'faire' | 'modalyst' | 'printful' | 'spocket';
  isActive: boolean;
  apiKey?: string;
  lastSync?: number;
}

export interface PricingConfig {
  marginGoal: number;
  dynamicPricingEnabled: boolean;
  competitorTracking: boolean;
}