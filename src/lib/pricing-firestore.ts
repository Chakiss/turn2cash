import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { getDB } from './firebase';
import type { Device, PriceRange, BrandData } from '@/types';

// Cache for pricing data to avoid repeated Firestore calls
let deviceCache: Map<string, any> = new Map();
let brandCache: BrandData[] | null = null;
let cacheExpiry = 0;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get price estimate from the new Firestore structure
export async function getPriceEstimate(device: Device): Promise<PriceRange | null> {
  try {
    const db = await getDB();
    if (!db) {
      // Fallback to static pricing if Firestore unavailable
      return getFallbackPriceEstimate(device);
    }

    // Create device document ID (brand_model format)
    const deviceDocId = `${device.brand}_${device.model}`;
    const now = Date.now();
    
    // Check cache first
    if (deviceCache.has(deviceDocId) && now < cacheExpiry) {
      const cached = deviceCache.get(deviceDocId);
      const pricing = cached.pricing?.[device.storage]?.[device.condition];
      if (pricing) {
        return { min: pricing.min, max: pricing.max };
      }
    }

    // Query Firestore for device document
    const deviceRef = doc(db, 'devices', deviceDocId);
    const deviceDoc = await getDoc(deviceRef);
    
    if (deviceDoc.exists()) {
      const data = deviceDoc.data();
      
      // Update cache
      deviceCache.set(deviceDocId, data);
      cacheExpiry = now + CACHE_DURATION;
      
      // Extract pricing for specific storage and condition
      const pricing = data.pricing?.[device.storage]?.[device.condition];
      if (pricing) {
        return {
          min: pricing.min,
          max: pricing.max
        };
      }
    }

    // If not found in Firestore, try fallback
    return getFallbackPriceEstimate(device);
    
  } catch (error) {
    console.error('Error fetching price estimate:', error);
    // Fallback to static pricing on error
    return getFallbackPriceEstimate(device);
  }
}

// Function to get available storage options for a model from new structure
export async function getStorageOptions(brand: string, model: string): Promise<string[]> {
  try {
    const db = await getDB();
    if (!db) {
      return getFallbackStorageOptions(brand, model);
    }

    // Create device document ID
    const deviceDocId = `${brand}_${model}`;
    
    // Check cache first
    const now = Date.now();
    if (deviceCache.has(deviceDocId) && now < cacheExpiry) {
      const cached = deviceCache.get(deviceDocId);
      return cached.storage_options || [];
    }

    // Query for device document
    const deviceRef = doc(db, 'devices', deviceDocId);
    const deviceDoc = await getDoc(deviceRef);
    
    if (deviceDoc.exists()) {
      const data = deviceDoc.data();
      
      // Update cache
      deviceCache.set(deviceDocId, data);
      cacheExpiry = now + CACHE_DURATION;
      
      return data.storage_options || [];
    }

    return getFallbackStorageOptions(brand, model);
    
  } catch (error) {
    console.error('Error fetching storage options:', error);
    return getFallbackStorageOptions(brand, model);
  }
}

// Function to get brand data from new structure
export async function getBrandData(): Promise<BrandData[]> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Firebase not available, using fallback brand data');
      return getFallbackBrandData();
    }

    // Check cache
    const now = Date.now();
    if (brandCache && now < cacheExpiry) {
      console.log('📦 Returning cached brand data');
      return brandCache;
    }

    console.log('🔄 Fetching brand data from Firestore...');

    // Get all brands from the brands collection
    const brandsQuery = query(
      collection(db, 'brands'),
      where('active', '==', true),
      orderBy('name')
    );
    
    const brandsSnapshot = await getDocs(brandsQuery);
    console.log(`📱 Found ${brandsSnapshot.size} active brands`);
    
    const brands: BrandData[] = [];
    
    // For each brand, get its models from devices collection
    for (const brandDoc of brandsSnapshot.docs) {
      const brandData = brandDoc.data();
      const brandName = brandData.name;
      
      console.log(`🔍 Loading models for brand: ${brandName}`);
      
      // Get all devices for this brand
      const devicesQuery = query(
        collection(db, 'devices'),
        where('brand', '==', brandName),
        where('active', '==', true),
        orderBy('model')
      );
      
      const devicesSnapshot = await getDocs(devicesQuery);
      const models: string[] = [];
      const storageOptionsSet = new Set<string>();
      
      devicesSnapshot.forEach((deviceDoc) => {
        const deviceData = deviceDoc.data();
        models.push(deviceData.model);
        
        // Collect all storage options for this brand
        if (deviceData.storage_options && Array.isArray(deviceData.storage_options)) {
          deviceData.storage_options.forEach((storage: string) => {
            storageOptionsSet.add(storage);
          });
        }
      });
      
      console.log(`✅ Brand ${brandName}: ${models.length} models, storage options: ${Array.from(storageOptionsSet)}`);
      
      brands.push({
        name: brandName,
        models: models,
        storageOptions: Array.from(storageOptionsSet).sort((a, b) => {
          // Sort by storage size (64GB, 128GB, 256GB, etc.)
          const aSize = parseInt(a);
          const bSize = parseInt(b);
          return aSize - bSize;
        })
      });
    }

    // Update cache
    brandCache = brands;
    cacheExpiry = now + CACHE_DURATION;

    console.log(`🎉 Successfully loaded ${brands.length} brands from Firestore`);
    return brands.length > 0 ? brands : getFallbackBrandData();
    
  } catch (error) {
    console.error('❌ Error fetching brand data:', error);
    return getFallbackBrandData();
  }
}

// Function to get all device data for admin (simplified with new structure)
export async function getAllDevicesData() {
  try {
    const db = await getDB();
    if (!db) return [];

    const devicesQuery = query(
      collection(db, 'devices'),
      where('active', '==', true),
      orderBy('brand'),
      orderBy('release_year', 'desc')
    );
    
    const querySnapshot = await getDocs(devicesQuery);
    const devices: any[] = [];
    
    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return devices;
    
  } catch (error) {
    console.error('Error fetching devices data:', error);
    return [];
  }
}

// Function to format price in Thai Baht
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
}

// Function to format price range
export function formatPriceRange(range: PriceRange): string {
  if (range.min === range.max) {
    return formatPrice(range.min);
  }
  return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
}

// Fallback functions using static data (for when Firestore is unavailable)
function getFallbackPriceEstimate(device: Device): PriceRange | null {
  // Static fallback pricing data (subset of original data)
  const fallbackPricing: any = {
    iPhone13: {
      '128GB': {
        good: { min: 11000, max: 11500 },
        fair: { min: 10000, max: 10500 },
        bad: { min: 9000, max: 9500 }
      },
      '256GB': {
        good: { min: 12500, max: 13000 },
        fair: { min: 11500, max: 12000 },
        bad: { min: 10500, max: 11000 }
      }
    },
    iPhone14: {
      '128GB': {
        good: { min: 16000, max: 16500 },
        fair: { min: 15000, max: 15500 },
        bad: { min: 14000, max: 14500 }
      }
    },
    GalaxyS23: {
      '128GB': {
        good: { min: 18000, max: 18500 },
        fair: { min: 17000, max: 17500 },
        bad: { min: 16000, max: 16500 }
      }
    }
  };

  const modelData = fallbackPricing[device.model];
  if (!modelData) return null;

  const storageData = modelData[device.storage];
  if (!storageData) return null;

  const conditionData = storageData[device.condition];
  if (!conditionData) return null;

  return {
    min: conditionData.min,
    max: conditionData.max,
  };
}

function getFallbackStorageOptions(brand: string, model: string): string[] {
  const fallbackOptions: any = {
    iPhone13: ['128GB', '256GB', '512GB'],
    iPhone14: ['128GB', '256GB', '512GB'],
    iPhone15: ['128GB', '256GB', '512GB'],
    GalaxyS23: ['128GB', '256GB'],
    Pixel8: ['128GB', '256GB']
  };

  return fallbackOptions[model] || ['128GB', '256GB'];
}

function getFallbackBrandData(): BrandData[] {
  return [
    {
      name: 'Apple',
      models: ['iPhone13', 'iPhone14', 'iPhone15'],
      storageOptions: ['128GB', '256GB', '512GB'],
    },
    {
      name: 'Samsung',
      models: ['GalaxyS23'],
      storageOptions: ['128GB', '256GB'],
    },
    {
      name: 'Google',
      models: ['Pixel8'],
      storageOptions: ['128GB', '256GB'],
    },
  ];
}