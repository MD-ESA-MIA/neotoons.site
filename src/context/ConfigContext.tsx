import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  featureService, 
  Feature, 
  cmsService, 
  CMSContent, 
  pluginService, 
  Plugin,
  pricingService,
  PricingPlan,
  pageService,
  CustomPage
} from '../services/appServices';

interface ConfigContextType {
  features: Feature[];
  cms: CMSContent;
  plugins: Plugin[];
  pricing: PricingPlan[];
  pages: CustomPage[];
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const DEFAULT_PRICING: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    interval: 'month',
    features: ['20 generations', 'Basic support'],
    status: true,
    credits: 20,
  },
];

const isPricingPlan = (item: unknown): item is PricingPlan => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const plan = item as Record<string, unknown>;
  return (
    typeof plan.id === 'string' &&
    typeof plan.name === 'string' &&
    Array.isArray(plan.features)
  );
};

const normalizePricing = (data: unknown): PricingPlan[] => {
  if (Array.isArray(data)) {
    return data.filter(isPricingPlan);
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;

    if (Array.isArray(record.pricing)) {
      return record.pricing.filter(isPricingPlan);
    }

    if (Array.isArray(record.plans)) {
      return record.plans.filter(isPricingPlan);
    }

    const objectValues = Object.values(record);
    if (objectValues.every(isPricingPlan)) {
      return objectValues;
    }
  }

  return [];
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [cms, setCms] = useState<CMSContent | null>(null);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [pricing, setPricing] = useState<PricingPlan[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubFeatures = featureService.subscribe(setFeatures);
    const unsubCMS = cmsService.subscribe(setCms);
    const unsubPlugins = pluginService.subscribe(setPlugins);
    const unsubPricing = pricingService.subscribe((data) => {
      const normalized = normalizePricing(data);
      setPricing(normalized.length > 0 ? normalized : DEFAULT_PRICING);
    });
    const unsubPages = pageService.subscribe(setPages);

    setLoading(false);

    return () => {
      unsubFeatures();
      unsubCMS();
      unsubPlugins();
      unsubPricing();
      unsubPages();
    };
  }, []);

  return (
    <ConfigContext.Provider value={{ 
      features, 
      cms: cms || {} as CMSContent, 
      plugins, 
      pricing,
      pages,
      loading 
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export const useFeature = (featureId: string) => {
  const { features } = useConfig();
  const feature = features.find(f => f.id === featureId);
  return feature ? feature.enabled : false;
};
