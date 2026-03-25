const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Sample pricing data structure
const pricingData = {
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

// Brand data
const brandData = [
  {
    name: 'Apple',
    models: ['iPhone11', 'iPhone12', 'iPhone13', 'iPhone14', 'iPhone15'],
    storageOptions: ['64GB', '128GB', '256GB', '512GB'],
    active: true
  },
  {
    name: 'Samsung', 
    models: ['Galaxy S21', 'Galaxy S22', 'Galaxy S23'],
    storageOptions: ['128GB', '256GB'],
    active: true
  },
  {
    name: 'Google',
    models: ['Pixel 7', 'Pixel 8'],
    storageOptions: ['128GB', '256GB'], 
    active: true
  },
];

// Sample leads for testing
const sampleLeads = [
  {
    id: 'L20260325120000',
    name: 'สมชาย อ่อนละมุน',
    phone: '0812345678',
    line_id: 'somchai_123',
    address: '123/45 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110',
    device: {
      brand: 'Apple',
      model: 'iPhone13', 
      storage: '128GB',
      condition: 'good'
    },
    price_min: 11000,
    price_max: 11500,
    images: [],
    status: 'NEW',
    created_at: new Date('2026-03-25T12:00:00Z')
  },
  {
    id: 'L20260325130000',
    name: 'สมหญิง ใจดี',
    phone: '0987654321',
    line_id: 'somying_456',
    address: '456/78 ถ.รามอินทรา แขวงคันนายาว เขตคันนายาว กรุงเทพฯ 10230',
    device: {
      brand: 'Samsung',
      model: 'Galaxy S23',
      storage: '256GB', 
      condition: 'fair'
    },
    price_min: 19000,
    price_max: 19500,
    images: [],
    status: 'CONTACTED',
    created_at: new Date('2026-03-25T13:00:00Z')
  },
  {
    id: 'L20260325140000',
    name: 'วิทยา เรียนดี',
    phone: '0891234567',
    line_id: '',
    address: '789/12 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    device: {
      brand: 'Google',
      model: 'Pixel 8',
      storage: '128GB',
      condition: 'good'
    },
    price_min: 15000,
    price_max: 15500,
    images: [],
    status: 'COMPLETED',
    created_at: new Date('2026-03-25T14:00:00Z')
  }
];

async function populateFirestore() {
  try {
    console.log('🚀 Starting Firestore population...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. Add Brands
    console.log('📱 Adding brand data...');
    for (const brand of brandData) {
      await setDoc(doc(db, 'brands', brand.name), {
        ...brand,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log(`   ✅ Added brand: ${brand.name}`);
    }

    // 2. Add Pricing Data
    console.log('💰 Adding pricing data...');
    for (const [model, storageData] of Object.entries(pricingData)) {
      for (const [storage, conditionData] of Object.entries(storageData)) {
        for (const [condition, priceRange] of Object.entries(conditionData)) {
          const docId = `${model}_${storage}_${condition}`;
          await setDoc(doc(db, 'pricing', docId), {
            model,
            storage,
            condition,
            price_min: priceRange[0],
            price_max: priceRange[1],
            currency: 'THB',
            active: true,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      console.log(`   ✅ Added pricing for: ${model}`);
    }

    // 3. Add Sample Leads
    console.log('👥 Adding sample leads...');
    for (const lead of sampleLeads) {
      await setDoc(doc(db, 'leads', lead.id), {
        ...lead,
        created_at: lead.created_at,
        updated_at: new Date()
      });
      console.log(`   ✅ Added lead: ${lead.id} (${lead.name})`);
    }

    console.log('🎉 Firestore population completed successfully!');
    console.log(`
📊 Summary:
   • ${brandData.length} brands added
   • ${Object.keys(pricingData).reduce((total, model) => {
      return total + Object.keys(pricingData[model]).reduce((storageTotal, storage) => {
        return storageTotal + Object.keys(pricingData[model][storage]).length;
      }, 0);
    }, 0)} pricing entries added
   • ${sampleLeads.length} sample leads added

🔗 Check your Firebase Console to see the data!
`);

  } catch (error) {
    console.error('❌ Error populating Firestore:', error);
    process.exit(1);
  }
}

// Run the population script
populateFirestore();