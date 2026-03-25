import { createLead } from './leadService';
import { createDevice } from './deviceService';
import type { LeadFormData, DeviceFormData } from '@/types';

// Sample lead data
const sampleLeads: LeadFormData[] = [
  {
    name: 'อภิชัย สมิทธิ์',
    phone: '081-234-5678',
    line_id: 'apichai_s',
    address: '123 ถนนสุขุมวิท กรุงเทพ 10110',
    device: {
      brand: 'Apple',
      model: 'iPhone 15',
      storage: '128GB',
      condition: 'good'
    },
    price_estimate: [25000, 28000],
    images: []
  },
  {
    name: 'สุนิษา ดีใจ',
    phone: '082-345-6789',
    line_id: 'sunisa_d',
    address: '456 ถนนรัชดาภิเษก กรุงเทพ 10400',
    device: {
      brand: 'Samsung',
      model: 'Galaxy S24',
      storage: '256GB',
      condition: 'fair'
    },
    price_estimate: [18000, 21000],
    images: []
  },
  {
    name: 'กิตติ่ เรือนทอง',
    phone: '083-456-7890',
    line_id: 'kitti_r',
    address: '789 ถนนพหลโยธิน กรุงเทพ 10220',
    device: {
      brand: 'Apple',
      model: 'iPhone 14',
      storage: '256GB',
      condition: 'good'
    },
    price_estimate: [22000, 25000],
    images: []
  },
  {
    name: 'มาริสา โพธิ์ทอง',
    phone: '084-567-8901',
    line_id: 'marisa_p',
    address: '321 ถนนลาดพร้าว กรุงเทพ 10310',
    device: {
      brand: 'Xiaomi',
      model: 'Mi 13',
      storage: '128GB',
      condition: 'fair'
    },
    price_estimate: [12000, 15000],
    images: []
  }
];

// Sample device data  
const sampleDevices: DeviceFormData[] = [
  {
    brand: 'Apple',
    model: 'iPhone 15',
    storage_options: ['128GB', '256GB', '512GB', '1TB'],
    active: true
  },
  {
    brand: 'Apple', 
    model: 'iPhone 14',
    storage_options: ['128GB', '256GB', '512GB'],
    active: true
  },
  {
    brand: 'Apple',
    model: 'iPhone 13',
    storage_options: ['128GB', '256GB', '512GB'],
    active: true
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S24',
    storage_options: ['128GB', '256GB', '512GB'],
    active: true
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S23',
    storage_options: ['128GB', '256GB'],
    active: true
  },
  {
    brand: 'Xiaomi',
    model: 'Mi 13',
    storage_options: ['128GB', '256GB'],
    active: true
  },
  {
    brand: 'OPPO',
    model: 'Find X6',
    storage_options: ['128GB', '256GB', '512GB'],
    active: true
  }
];

// Function to populate sample data
export async function populateSampleData() {
  try {
    console.log('🚀 Starting to populate sample data...');

    // Create devices first
    console.log('📱 Creating sample devices...');
    for (const device of sampleDevices) {
      try {
        const deviceId = await createDevice(device);
        console.log(`✅ Created device: ${device.brand} ${device.model} (ID: ${deviceId})`);
      } catch (error) {
        console.log(`⚠️ Device ${device.brand} ${device.model} may already exist`);
      }
    }

    // Create leads
    console.log('👥 Creating sample leads...');
    for (const lead of sampleLeads) {
      try {
        const leadId = await createLead(lead);
        console.log(`✅ Created lead: ${lead.name} (ID: ${leadId})`);
      } catch (error) {
        console.error(`❌ Failed to create lead: ${lead.name}`, error);
      }
    }

    console.log('🎉 Sample data population completed!');
    return {
      devices: sampleDevices.length,
      leads: sampleLeads.length
    };
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    throw error;
  }
}

// Function to check if data exists
export async function checkDataExists() {
  try {
    const { getAllDevices } = await import('./deviceService');
    const { getLeads } = await import('./leadService');
    
    const [devices, leads] = await Promise.all([
      getAllDevices(),
      getLeads()
    ]);

    console.log('📊 Current data status:');
    console.log(`   Devices: ${devices.length}`);
    console.log(`   Leads: ${leads.length}`);
    
    return {
      hasDevices: devices.length > 0,
      hasLeads: leads.length > 0,
      deviceCount: devices.length,
      leadCount: leads.length
    };
  } catch (error) {
    console.error('❌ Error checking data:', error);
    return { hasDevices: false, hasLeads: false, deviceCount: 0, leadCount: 0 };
  }
}