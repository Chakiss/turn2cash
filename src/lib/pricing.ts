import type { PricingData, BrandData, Device, PriceRange } from '@/types';

// Static pricing data for Thai market (in THB)
export const pricingData: PricingData = {
  iPhone11: {
    '64GB': {
      good: [4800, 5200],
      fair: [4200, 4700],
      bad: [3500, 4000],
    },
    '128GB': {
      good: [5500, 6000],
      fair: [4800, 5300],
      bad: [4000, 4500],
    },
    '256GB': {
      good: [6500, 7000],
      fair: [5800, 6300],
      bad: [5000, 5500],
    },
  },
  iPhone12: {
    '64GB': {
      good: [6800, 7300],
      fair: [6000, 6500],
      bad: [5200, 5700],
    },
    '128GB': {
      good: [7800, 8300],
      fair: [7000, 7500],
      bad: [6200, 6700],
    },
    '256GB': {
      good: [9000, 9500],
      fair: [8200, 8700],
      bad: [7400, 7900],
    },
  },
  iPhone13: {
    '128GB': {
      good: [11000, 11500],
      fair: [10000, 10500],
      bad: [9000, 9500],
    },
    '256GB': {
      good: [12500, 13000],
      fair: [11500, 12000],
      bad: [10500, 11000],
    },
    '512GB': {
      good: [15000, 15500],
      fair: [14000, 14500],
      bad: [13000, 13500],
    },
  },
  iPhone14: {
    '128GB': {
      good: [16000, 16500],
      fair: [15000, 15500],
      bad: [14000, 14500],
    },
    '256GB': {
      good: [18000, 18500],
      fair: [17000, 17500],
      bad: [16000, 16500],
    },
    '512GB': {
      good: [22000, 22500],
      fair: [21000, 21500],
      bad: [20000, 20500],
    },
  },
  iPhone15: {
    '128GB': {
      good: [22000, 22500],
      fair: [21000, 21500],
      bad: [20000, 20500],
    },
    '256GB': {
      good: [25000, 25500],
      fair: [24000, 24500],
      bad: [23000, 23500],
    },
    '512GB': {
      good: [30000, 30500],
      fair: [29000, 29500],
      bad: [28000, 28500],
    },
  },
  'Galaxy S21': {
    '128GB': {
      good: [8000, 8500],
      fair: [7200, 7700],
      bad: [6400, 6900],
    },
    '256GB': {
      good: [9500, 10000],
      fair: [8700, 9200],
      bad: [7900, 8400],
    },
  },
  'Galaxy S22': {
    '128GB': {
      good: [12000, 12500],
      fair: [11000, 11500],
      bad: [10000, 10500],
    },
    '256GB': {
      good: [14000, 14500],
      fair: [13000, 13500],
      bad: [12000, 12500],
    },
  },
  'Galaxy S23': {
    '128GB': {
      good: [18000, 18500],
      fair: [17000, 17500],
      bad: [16000, 16500],
    },
    '256GB': {
      good: [20000, 20500],
      fair: [19000, 19500],
      bad: [18000, 18500],
    },
  },
  'Pixel 7': {
    '128GB': {
      good: [9000, 9500],
      fair: [8200, 8700],
      bad: [7400, 7900],
    },
    '256GB': {
      good: [11000, 11500],
      fair: [10200, 10700],
      bad: [9400, 9900],
    },
  },
  'Pixel 8': {
    '128GB': {
      good: [15000, 15500],
      fair: [14200, 14700],
      bad: [13400, 13900],
    },
    '256GB': {
      good: [17000, 17500],
      fair: [16200, 16700],
      bad: [15400, 15900],
    },
  },
};

// Brand and model data
export const brandData: BrandData[] = [
  {
    name: 'Apple',
    models: ['iPhone11', 'iPhone12', 'iPhone13', 'iPhone14', 'iPhone15'],
    storageOptions: ['64GB', '128GB', '256GB', '512GB'],
  },
  {
    name: 'Samsung',
    models: ['Galaxy S21', 'Galaxy S22', 'Galaxy S23'],
    storageOptions: ['128GB', '256GB'],
  },
  {
    name: 'Google',
    models: ['Pixel 7', 'Pixel 8'],
    storageOptions: ['128GB', '256GB'],
  },
];

// Function to get price estimate
export function getPriceEstimate(device: Device): PriceRange | null {
  const modelData = pricingData[device.model];
  if (!modelData) return null;

  const storageData = modelData[device.storage];
  if (!storageData) return null;

  const conditionData = storageData[device.condition];
  if (!conditionData) return null;

  return {
    min: conditionData[0],
    max: conditionData[1],
  };
}

// Function to get available storage options for a model
export function getStorageOptions(brand: string, model: string): string[] {
  const brandInfo = brandData.find(b => b.name === brand);
  if (!brandInfo || !brandInfo.models.includes(model)) return [];

  const modelData = pricingData[model];
  if (!modelData) return [];

  return Object.keys(modelData);
}

// Function to format price in Thai Baht
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Function to format price range
export function formatPriceRange(range: PriceRange): string {
  return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
}