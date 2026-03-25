import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  Timestamp 
} from 'firebase/firestore';
import { getDB } from './firebase';
import type { DeviceModel, DeviceFormData, BrandInfo, DevicePricingData } from '@/types';

const DEVICES_COLLECTION = 'devices';
const BRANDS_COLLECTION = 'brands';

// Generate device document ID in format Brand_Model (e.g., Apple_iPhone15)
function generateDeviceId(brand: string, model: string): string {
  const cleanBrand = brand.replace(/\s+/g, '');
  const cleanModel = model.replace(/\s+/g, '');
  return `${cleanBrand}_${cleanModel}`;
}

// Generate brand document ID (same as brand name but normalized)
function generateBrandId(brand: string): string {
  return brand.replace(/\s+/g, '');
}

// Get all devices with optional brand filter
export async function getAllDevices(brandFilter?: string): Promise<DeviceModel[]> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Database not available, using mock devices');
      return getMockDevices();
    }

    let devicesQuery = query(
      collection(db, DEVICES_COLLECTION), 
      orderBy('brand'), 
      orderBy('model')
    );

    if (brandFilter) {
      devicesQuery = query(
        collection(db, DEVICES_COLLECTION),
        where('brand', '==', brandFilter),
        orderBy('model')
      );
    }

    const querySnapshot = await getDocs(devicesQuery);
    const devices: DeviceModel[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      devices.push({
        id: doc.id,
        brand: data.brand || '',
        model: data.model || '',
        storage_options: data.storage_options || [],
        active: data.active !== false, // Default to true if not specified
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      });
    });

    return devices;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return getMockDevices();
  }
}

// Get device by ID
export async function getDevice(deviceId: string): Promise<DeviceModel | null> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Database not available');
      return null;
    }

    const deviceRef = doc(db, DEVICES_COLLECTION, deviceId);
    const deviceDoc = await getDoc(deviceRef);
    
    if (deviceDoc.exists()) {
      const data = deviceDoc.data();
      return {
        id: deviceDoc.id,
        brand: data.brand || '',
        model: data.model || '',
        storage_options: data.storage_options || [],
        active: data.active !== false,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching device:', error);
    return null;
  }
}

// Create a new device
export async function createDevice(deviceData: DeviceFormData): Promise<string> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Database not available, using mock device ID');
      return `mock_${Date.now()}`;
    }

    const deviceId = generateDeviceId(deviceData.brand, deviceData.model);
    const brandId = generateBrandId(deviceData.brand);
    const now = Timestamp.fromDate(new Date());

    // Use transaction to ensure consistency between brands and devices
    const result = await runTransaction(db, async (transaction) => {
      const deviceRef = doc(db, DEVICES_COLLECTION, deviceId);
      const brandRef = doc(db, BRANDS_COLLECTION, brandId);
      
      // Check if device already exists
      const existingDevice = await transaction.get(deviceRef);
      if (existingDevice.exists()) {
        throw new Error(`อุปกรณ์ ${deviceData.brand} ${deviceData.model} มีอยู่แล้วในระบบ`);
      }

      // Get or create brand document
      const brandDoc = await transaction.get(brandRef);
      let deviceCount = 1;
      
      if (brandDoc.exists()) {
        deviceCount = (brandDoc.data().device_count || 0) + 1;
        transaction.update(brandRef, {
          device_count: deviceCount,
          updated_at: now
        });
      } else {
        transaction.set(brandRef, {
          name: deviceData.brand,
          device_count: 1,
          created_at: now,
          updated_at: now
        });
      }

      // Create device document
      const newDevice = {
        brand: deviceData.brand,
        model: deviceData.model,
        storage_options: deviceData.storage_options || [],
        active: deviceData.active !== false,
        created_at: now,
        updated_at: now,
      };

      transaction.set(deviceRef, newDevice);
      
      return deviceId;
    });

    console.log('Device created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating device:', error);
    throw error;
  }
}

// Update an existing device
export async function updateDevice(deviceId: string, updates: Partial<DeviceFormData>): Promise<void> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Database not available');
      return;
    }

    const deviceRef = doc(db, DEVICES_COLLECTION, deviceId);
    const now = Timestamp.fromDate(new Date());

    const updateData: any = {
      updated_at: now
    };

    // Only update fields that are provided
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.model !== undefined) updateData.model = updates.model;
    if (updates.storage_options !== undefined) updateData.storage_options = updates.storage_options;
    if (updates.active !== undefined) updateData.active = updates.active;

    await updateDoc(deviceRef, updateData);
    console.log('Device updated successfully');
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
}

// Delete a device
export async function deleteDevice(deviceId: string): Promise<void> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Database not available');
      return;
    }

    // Get device info first to update brand count
    const device = await getDevice(deviceId);
    if (!device) {
      throw new Error('ไม่พบอุปกรณ์ที่ต้องการลบ');
    }

    const brandId = generateBrandId(device.brand);

    // Use transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      const deviceRef = doc(db, DEVICES_COLLECTION, deviceId);
      const brandRef = doc(db, BRANDS_COLLECTION, brandId);
      
      // Delete device
      transaction.delete(deviceRef);
      
      // Update brand device count
      const brandDoc = await transaction.get(brandRef);
      if (brandDoc.exists()) {
        const currentCount = brandDoc.data().device_count || 1;
        const newCount = Math.max(0, currentCount - 1);
        
        if (newCount === 0) {
          // Delete brand if no devices left
          transaction.delete(brandRef);
        } else {
          transaction.update(brandRef, {
            device_count: newCount,
            updated_at: Timestamp.fromDate(new Date())
          });
        }
      }
    });

    console.log('Device deleted successfully');
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
}

// Get all brands with device counts
export async function getAllBrands(): Promise<BrandInfo[]> {
  try {
    const db = await getDB();
    if (!db) {
      console.warn('Database not available, using mock brands');
      return getMockBrands();
    }

    const brandsQuery = query(
      collection(db, BRANDS_COLLECTION), 
      orderBy('name')
    );

    const querySnapshot = await getDocs(brandsQuery);
    const brands: BrandInfo[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      brands.push({
        name: data.name || '',
        device_count: data.device_count || 0,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      });
    });

    return brands;
  } catch (error) {
    console.error('Error fetching brands:', error);
    return getMockBrands();
  }
}

// Toggle device active status
export async function toggleDeviceStatus(deviceId: string): Promise<void> {
  try {
    const device = await getDevice(deviceId);
    if (!device) {
      throw new Error('ไม่พบอุปกรณ์ที่ต้องการเปลี่ยนสถานะ');
    }

    await updateDevice(deviceId, { active: !device.active });
  } catch (error) {
    console.error('Error toggling device status:', error);
    throw error;
  }
}

// Get device pricing data (if it exists)
export async function getDevicePricing(deviceId: string): Promise<DevicePricingData | null> {
  try {
    const db = await getDB();
    if (!db) {
      return null;
    }

    const deviceRef = doc(db, DEVICES_COLLECTION, deviceId);
    const deviceDoc = await getDoc(deviceRef);
    
    if (deviceDoc.exists()) {
      const data = deviceDoc.data();
      return data.pricing || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching device pricing:', error);
    return null;
  }
}

// Check if device model exists
export async function deviceExists(brand: string, model: string): Promise<boolean> {
  try {
    const deviceId = generateDeviceId(brand, model);
    const device = await getDevice(deviceId);
    return device !== null;
  } catch (error) {
    console.error('Error checking device existence:', error);
    return false;
  }
}

// Mock data for development/fallback
function getMockDevices(): DeviceModel[] {
  return [
    {
      id: 'Apple_iPhone15',
      brand: 'Apple',
      model: 'iPhone 15',
      storage_options: ['128GB', '256GB', '512GB'],
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'Samsung_GalaxyS24',
      brand: 'Samsung',
      model: 'Galaxy S24',
      storage_options: ['128GB', '256GB', '512GB'],
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
}

function getMockBrands(): BrandInfo[] {
  return [
    {
      name: 'Apple',
      device_count: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Samsung',
      device_count: 3,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
}