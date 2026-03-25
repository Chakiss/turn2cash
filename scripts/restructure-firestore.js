const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc, writeBatch } = require('firebase/firestore');
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

// Better structured pricing data
const deviceDatabase = {
  brands: {
    Apple: {
      name: "Apple",
      logo: "🍎",
      active: true,
      models: {
        iPhone11: {
          name: "iPhone 11",
          category: "iPhone",
          release_year: 2019,
          active: true,
          storage_options: ["64GB", "128GB", "256GB"],
          pricing: {
            "64GB": {
              good: { min: 4800, max: 5200 },
              fair: { min: 4200, max: 4700 },
              bad: { min: 3500, max: 4000 }
            },
            "128GB": {
              good: { min: 5500, max: 6000 },
              fair: { min: 4800, max: 5300 },
              bad: { min: 4000, max: 4500 }
            },
            "256GB": {
              good: { min: 6500, max: 7000 },
              fair: { min: 5800, max: 6300 },
              bad: { min: 5000, max: 5500 }
            }
          }
        },
        iPhone12: {
          name: "iPhone 12",
          category: "iPhone", 
          release_year: 2020,
          active: true,
          storage_options: ["64GB", "128GB", "256GB"],
          pricing: {
            "64GB": {
              good: { min: 6800, max: 7300 },
              fair: { min: 6000, max: 6500 },
              bad: { min: 5200, max: 5700 }
            },
            "128GB": {
              good: { min: 7800, max: 8300 },
              fair: { min: 7000, max: 7500 },
              bad: { min: 6200, max: 6700 }
            },
            "256GB": {
              good: { min: 9000, max: 9500 },
              fair: { min: 8200, max: 8700 },
              bad: { min: 7400, max: 7900 }
            }
          }
        },
        iPhone13: {
          name: "iPhone 13",
          category: "iPhone",
          release_year: 2021,
          active: true,
          storage_options: ["128GB", "256GB", "512GB"],
          pricing: {
            "128GB": {
              good: { min: 11000, max: 11500 },
              fair: { min: 10000, max: 10500 },
              bad: { min: 9000, max: 9500 }
            },
            "256GB": {
              good: { min: 12500, max: 13000 },
              fair: { min: 11500, max: 12000 },
              bad: { min: 10500, max: 11000 }
            },
            "512GB": {
              good: { min: 15000, max: 15500 },
              fair: { min: 14000, max: 14500 },
              bad: { min: 13000, max: 13500 }
            }
          }
        },
        iPhone14: {
          name: "iPhone 14",
          category: "iPhone",
          release_year: 2022,
          active: true,
          storage_options: ["128GB", "256GB", "512GB"],
          pricing: {
            "128GB": {
              good: { min: 16000, max: 16500 },
              fair: { min: 15000, max: 15500 },
              bad: { min: 14000, max: 14500 }
            },
            "256GB": {
              good: { min: 18000, max: 18500 },
              fair: { min: 17000, max: 17500 },
              bad: { min: 16000, max: 16500 }
            },
            "512GB": {
              good: { min: 22000, max: 22500 },
              fair: { min: 21000, max: 21500 },
              bad: { min: 20000, max: 20500 }
            }
          }
        },
        iPhone15: {
          name: "iPhone 15",
          category: "iPhone",
          release_year: 2023,
          active: true,
          storage_options: ["128GB", "256GB", "512GB"],
          pricing: {
            "128GB": {
              good: { min: 22000, max: 22500 },
              fair: { min: 21000, max: 21500 },
              bad: { min: 20000, max: 20500 }
            },
            "256GB": {
              good: { min: 25000, max: 25500 },
              fair: { min: 24000, max: 24500 },
              bad: { min: 23000, max: 23500 }
            },
            "512GB": {
              good: { min: 30000, max: 30500 },
              fair: { min: 29000, max: 29500 },
              bad: { min: 28000, max: 28500 }
            }
          }
        }
      }
    },
    Samsung: {
      name: "Samsung",
      logo: "📱",
      active: true,
      models: {
        GalaxyS21: {
          name: "Galaxy S21",
          category: "Galaxy S",
          release_year: 2021,
          active: true,
          storage_options: ["128GB", "256GB"],
          pricing: {
            "128GB": {
              good: { min: 8000, max: 8500 },
              fair: { min: 7200, max: 7700 },
              bad: { min: 6400, max: 6900 }
            },
            "256GB": {
              good: { min: 9500, max: 10000 },
              fair: { min: 8700, max: 9200 },
              bad: { min: 7900, max: 8400 }
            }
          }
        },
        GalaxyS22: {
          name: "Galaxy S22",
          category: "Galaxy S",
          release_year: 2022,
          active: true,
          storage_options: ["128GB", "256GB"],
          pricing: {
            "128GB": {
              good: { min: 12000, max: 12500 },
              fair: { min: 11000, max: 11500 },
              bad: { min: 10000, max: 10500 }
            },
            "256GB": {
              good: { min: 14000, max: 14500 },
              fair: { min: 13000, max: 13500 },
              bad: { min: 12000, max: 12500 }
            }
          }
        },
        GalaxyS23: {
          name: "Galaxy S23",
          category: "Galaxy S",
          release_year: 2023,
          active: true,
          storage_options: ["128GB", "256GB"],
          pricing: {
            "128GB": {
              good: { min: 18000, max: 18500 },
              fair: { min: 17000, max: 17500 },
              bad: { min: 16000, max: 16500 }
            },
            "256GB": {
              good: { min: 20000, max: 20500 },
              fair: { min: 19000, max: 19500 },
              bad: { min: 18000, max: 18500 }
            }
          }
        }
      }
    },
    Google: {
      name: "Google", 
      logo: "📞",
      active: true,
      models: {
        Pixel7: {
          name: "Pixel 7",
          category: "Pixel",
          release_year: 2022,
          active: true,
          storage_options: ["128GB", "256GB"],
          pricing: {
            "128GB": {
              good: { min: 9000, max: 9500 },
              fair: { min: 8200, max: 8700 },
              bad: { min: 7400, max: 7900 }
            },
            "256GB": {
              good: { min: 11000, max: 11500 },
              fair: { min: 10200, max: 10700 },
              bad: { min: 9400, max: 9900 }
            }
          }
        },
        Pixel8: {
          name: "Pixel 8",
          category: "Pixel",
          release_year: 2023,
          active: true,
          storage_options: ["128GB", "256GB"],
          pricing: {
            "128GB": {
              good: { min: 15000, max: 15500 },
              fair: { min: 14200, max: 14700 },
              bad: { min: 13400, max: 13900 }
            },
            "256GB": {
              good: { min: 17000, max: 17500 },
              fair: { min: 16200, max: 16700 },
              bad: { min: 15400, max: 15900 }
            }
          }
        }
      }
    }
  }
};

// Sample leads with the new structure
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
      model: 'GalaxyS23',
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
      model: 'Pixel8',
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

async function clearAndRestructureFirestore() {
  try {
    console.log('🗑️  Starting Firestore cleanup and restructure...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📁 Creating improved hierarchical structure...');
    
    // 1. Create Brands Collection with proper structure
    console.log('🏢 Adding structured brand data...');
    for (const [brandKey, brandData] of Object.entries(deviceDatabase.brands)) {
      await setDoc(doc(db, 'brands', brandKey), {
        name: brandData.name,
        logo: brandData.logo,
        active: brandData.active,
        model_count: Object.keys(brandData.models).length,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log(`   ✅ Added brand: ${brandData.name} (${Object.keys(brandData.models).length} models)`);
    }

    // 2. Create Device Models Collection (Clean Structure)
    console.log('📱 Adding device models with embedded pricing...');
    for (const [brandKey, brandData] of Object.entries(deviceDatabase.brands)) {
      for (const [modelKey, modelData] of Object.entries(brandData.models)) {
        const docId = `${brandKey}_${modelKey}`;
        await setDoc(doc(db, 'devices', docId), {
          // Brand Information
          brand: brandData.name,
          brand_key: brandKey,
          brand_logo: brandData.logo,
          
          // Model Information
          model: modelData.name,
          model_key: modelKey,
          category: modelData.category,
          release_year: modelData.release_year,
          active: modelData.active,
          
          // Storage & Pricing (All in one document)
          storage_options: modelData.storage_options,
          pricing: modelData.pricing,
          
          // Metadata
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log(`   ✅ Added device: ${brandData.name} ${modelData.name}`);
      }
    }

    // Skip sample leads for now - focus on pricing restructure
    console.log('👥 Skipping sample leads for this restructure...');

    // 3. Create summary statistics
    const totalModels = Object.values(deviceDatabase.brands)
      .reduce((total, brand) => total + Object.keys(brand.models).length, 0);

    console.log('📊 Creating database summary...');
    await setDoc(doc(db, 'metadata', 'database_info'), {
      total_brands: Object.keys(deviceDatabase.brands).length,
      total_models: totalModels,
      last_updated: new Date(),
      structure_version: '2.0',
      description: 'Hierarchical structure with embedded pricing for better management'
    });

    console.log('🎉 Firestore restructure completed successfully!');
    console.log(`
📊 New Structure Summary:
   • ${Object.keys(deviceDatabase.brands).length} brands (Apple, Samsung, Google)
   • ${totalModels} device models with embedded pricing
   • Clean document IDs (Apple_iPhone13, Samsung_GalaxyS23, etc.)
   • All pricing data embedded in device documents
   • ${sampleLeads.length} sample leads

📋 Collection Structure:
   📂 /brands/{brandKey}           - Brand metadata
   📂 /devices/{brand}_{model}     - Device models with pricing
   📂 /leads/{leadId}              - Customer leads
   📂 /metadata/database_info      - Database summary

🎯 Benefits:
   • Easy to manage in Firestore Console
   • Better query performance
   • Logical grouping by brand
   • All pricing in one place per model
   • Clean, readable document IDs
`);

  } catch (error) {
    console.error('❌ Error restructuring Firestore:', error);
    process.exit(1);
  }
}

// Run the restructure
clearAndRestructureFirestore();