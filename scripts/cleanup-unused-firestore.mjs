// Firestore Cleanup Script using client SDK
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc
} from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupFirestore() {
  console.log('🧹 Starting Firestore cleanup...');
  console.log(`🔥 Project: ${firebaseConfig.projectId}`);

  try {
    // Define collections to keep
    const keepCollections = ['brands', 'devices', 'leads'];
    
    // Define patterns for old document IDs that should be removed
    const oldDocumentPatterns = [
      /^iPhone\d+_\d+GB_\w+$/, // iPhone13_128GB_good
      /^Galaxy\w+_\d+GB_\w+$/, // GalaxyS23_128GB_good  
      /^Pixel\d+_\d+GB_\w+$/, // Pixel8_128GB_good
      /^\w+_\d+GB_\w+$/, // Generic pattern for old pricing documents
    ];

    let deletedCount = 0;
    let checkedCollections = [];
    
    // Check known collections that might contain old data
    const possibleCollections = [
      'pricing', 'iPhone13', 'iPhone14', 'iPhone15',
      'GalaxyS21', 'GalaxyS22', 'GalaxyS23',
      'Pixel7', 'Pixel8'
    ];

    // Check each possible collection
    for (const collectionName of possibleCollections) {
      console.log(`🔍 Checking collection: ${collectionName}`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`📭 Collection ${collectionName} is empty or doesn't exist`);
          continue;
        }

        checkedCollections.push(collectionName);
        console.log(`📄 Found ${snapshot.size} documents in ${collectionName}`);

        // Check each document
        for (const docSnapshot of snapshot.docs) {
          const docId = docSnapshot.id;
          const docData = docSnapshot.data();
          
          // Check if this looks like an old pricing document
          const isOldPricingDoc = oldDocumentPatterns.some(pattern => 
            pattern.test(docId)
          );
          
          // Check if document has old pricing structure
          const hasOldStructure = (
            docData.hasOwnProperty('min') && 
            docData.hasOwnProperty('max') &&
            !docData.hasOwnProperty('brand') &&
            !docData.hasOwnProperty('pricing')
          );

          if (isOldPricingDoc || hasOldStructure) {
            console.log(`🗑️  Deleting old document: ${collectionName}/${docId}`);
            await deleteDoc(doc(db, collectionName, docId));
            deletedCount++;
          } else {
            console.log(`✅ Keeping document: ${collectionName}/${docId}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not access collection ${collectionName}: ${error.message}`);
      }
    }

    // Check current state of kept collections
    console.log('\n📋 Current Firestore structure (kept collections):');
    for (const keepCollection of keepCollections) {
      try {
        const collectionRef = collection(db, keepCollection);
        const snapshot = await getDocs(collectionRef);
        console.log(`  ${keepCollection}: ${snapshot.size} documents`);
        
        if (snapshot.size > 0 && snapshot.size <= 10) {
          snapshot.docs.forEach(docSnapshot => {
            console.log(`    - ${docSnapshot.id}`);
          });
        }
      } catch (error) {
        console.log(`  ${keepCollection}: Error accessing - ${error.message}`);
      }
    }

    console.log(`\n✅ Cleanup completed!`);
    console.log(`📊 Total documents deleted: ${deletedCount}`);
    console.log(`🗂️  Collections checked: ${checkedCollections.join(', ')}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the cleanup
cleanupFirestore();