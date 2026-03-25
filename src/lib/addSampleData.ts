import { getDB } from './firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Directly add sample data to Firestore using client-side Firebase
export async function addSampleDataToFirestore() {
  try {
    console.log('🔥 Adding sample data to Firestore...');
    const db = await getDB();
    if (!db) {
      throw new Error('Cannot connect to Firestore');
    }

    // Sample devices
    const devices = [
      { brand: 'Apple', model: 'iPhone 15', storage_options: ['128GB', '256GB', '512GB', '1TB'], active: true },
      { brand: 'Apple', model: 'iPhone 14', storage_options: ['128GB', '256GB', '512GB'], active: true },
      { brand: 'Apple', model: 'iPhone 13', storage_options: ['128GB', '256GB', '512GB'], active: true },
      { brand: 'Samsung', model: 'Galaxy S24', storage_options: ['128GB', '256GB', '512GB'], active: true },
      { brand: 'Samsung', model: 'Galaxy S23', storage_options: ['128GB', '256GB'], active: true },
      { brand: 'Xiaomi', model: 'Mi 13', storage_options: ['128GB', '256GB'], active: true }
    ];

    console.log('📱 Adding devices...');
    for (const device of devices) {
      const deviceId = `${device.brand.replace(/\s+/g, '')}_${device.model.replace(/\s+/g, '')}`;
      const brandId = device.brand.replace(/\s+/g, '');
      
      try {
        // Add device document
        await setDoc(doc(db, 'devices', deviceId), {
          brand: device.brand,
          model: device.model,
          storage_options: device.storage_options,
          active: device.active,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });

        // Add brand document
        await setDoc(doc(db, 'brands', brandId), {
          name: device.brand,
          device_count: 1, // This will be updated properly later
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        }, { merge: true });

        console.log(`✅ Added device: ${device.brand} ${device.model}`);
      } catch (error) {
        console.log(`⚠️ Device ${device.brand} ${device.model} may already exist`);
      }
    }

    // Sample leads
    const leads = [
      {
        name: 'อภิชัย สมิทธิ์',
        phone: '081-234-5678',
        line_id: 'apichai_s',
        address: '123 ถนนสุขุมวิท กรุงเทพ 10110',
        device: { brand: 'Apple', model: 'iPhone 15', storage: '128GB', condition: 'good' },
        price_min: 25000,
        price_max: 28000,
        images: [],
        status: 'NEW'
      },
      {
        name: 'สุนิษา ดีใจ',
        phone: '082-345-6789',
        line_id: 'sunisa_d', 
        address: '456 ถนนรัชดาภิเษก กรุงเทพ 10400',
        device: { brand: 'Samsung', model: 'Galaxy S24', storage: '256GB', condition: 'fair' },
        price_min: 18000,
        price_max: 21000,
        images: [],
        status: 'CONTACTED'
      },
      {
        name: 'กิตติ เรือนทอง',
        phone: '083-456-7890',
        line_id: 'kitti_r',
        address: '789 ถนนพหลโยธิน กรุงเทพ 10220',
        device: { brand: 'Apple', model: 'iPhone 14', storage: '256GB', condition: 'good' },
        price_min: 22000,
        price_max: 25000,
        images: [],
        status: 'PICKUP'
      },
      {
        name: 'มาริสา โพธิ์ทอง',
        phone: '084-567-8901',
        line_id: 'marisa_p',
        address: '321 ถนนลาดพร้าว กรุงเทพ 10310',
        device: { brand: 'Xiaomi', model: 'Mi 13', storage: '128GB', condition: 'fair' },
        price_min: 12000,
        price_max: 15000,
        images: [],
        status: 'COMPLETED'
      }
    ];

    console.log('👥 Adding leads...');
    for (let index = 0; index < leads.length; index++) {
      const lead = leads[index];
      const now = new Date();
      const leadId = `L${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(index).padStart(2, '0')}`;
      
      try {
        await setDoc(doc(db, 'leads', leadId), {
          ...lead,
          created_at: Timestamp.now()
        });
        console.log(`✅ Added lead: ${lead.name} (ID: ${leadId})`);
      } catch (error) {
        console.error(`❌ Failed to add lead: ${lead.name}`, error);
      }
    }

    console.log('🎉 Sample data added successfully!');
    return {
      devices: devices.length,
      leads: leads.length
    };

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  }
}