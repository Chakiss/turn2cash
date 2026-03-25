#!/usr/bin/env node

// Add sample data to Firestore for testing admin dashboard
const { execSync } = require('child_process');

async function main() {
  try {
    console.log('🔥 Adding sample data to Firestore...\n');
    
    // Run the population script via TypeScript
    const result = execSync(`npx ts-node -e "
      import('./src/lib/sampleData.ts').then(async (module) => {
        const data = await module.checkDataExists();
        console.log('Current data status:', data);
        
        if (!data.hasDevices || !data.hasLeads) {
          console.log('Adding sample data...');
          const result = await module.populateSampleData();
          console.log('Sample data added:', result);
        } else {
          console.log('Sample data already exists!');
        }
      });
    "`, { encoding: 'utf-8' });
    
    console.log(result);
    console.log('\n✅ Sample data operation completed!');
    console.log('🌐 You can now visit http://localhost:3001/admin to view the data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();