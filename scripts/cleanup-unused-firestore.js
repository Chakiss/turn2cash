const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'turn2cash-project';
  
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: projectId
  });
  
  console.log(`🔥 Connected to Firebase project: ${projectId}`);
}

const db = admin.firestore();

async function cleanupUnusedDocuments() {
  console.log('🧹 Starting Firestore cleanup...');
  
  try {
    // Get all collections
    const collections = await db.listCollections();
    console.log('📁 Found collections:', collections.map(c => c.id));

    // Define what should be kept (new structure)
    const keepCollections = ['brands', 'devices', 'leads'];
    
    // Define patterns for old document IDs that should be removed
    const oldDocumentPatterns = [
      /^iPhone\d+_\d+GB_\w+$/, // iPhone13_128GB_good
      /^Galaxy\w+_\d+GB_\w+$/, // GalaxyS23_128GB_good  
      /^Pixel\d+_\d+GB_\w+$/, // Pixel8_128GB_good
      /^\w+_\d+GB_\w+$/, // Generic pattern for old pricing documents
    ];

    let deletedCount = 0;

    for (const collection of collections) {
      const collectionId = collection.id;
      
      // Skip collections we want to keep
      if (keepCollections.includes(collectionId)) {
        console.log(`✅ Keeping collection: ${collectionId}`);
        continue;
      }

      console.log(`🔍 Checking collection: ${collectionId}`);
      
      // Get all documents in this collection
      const snapshot = await collection.get();
      
      if (snapshot.empty) {
        console.log(`📭 Collection ${collectionId} is empty`);
        continue;
      }

      // Check each document
      for (const doc of snapshot.docs) {
        const docId = doc.id;
        const docData = doc.data();
        
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
          console.log(`🗑️  Deleting old document: ${collectionId}/${docId}`);
          await doc.ref.delete();
          deletedCount++;
        } else {
          console.log(`✅ Keeping document: ${collectionId}/${docId}`);
        }
      }
      
      // If collection is now empty, we can optionally delete it
      const updatedSnapshot = await collection.get();
      if (updatedSnapshot.empty && !keepCollections.includes(collectionId)) {
        console.log(`🗑️  Collection ${collectionId} is now empty - consider manual deletion if needed`);
      }
    }

    console.log(`\n✅ Cleanup completed!`);
    console.log(`📊 Total documents deleted: ${deletedCount}`);
    
    // Show current state
    console.log('\n📋 Current Firestore structure:');
    for (const keepCollection of keepCollections) {
      try {
        const snapshot = await db.collection(keepCollection).get();
        console.log(`  ${keepCollection}: ${snapshot.size} documents`);
        
        if (snapshot.size > 0 && snapshot.size <= 10) {
          snapshot.docs.forEach(doc => {
            console.log(`    - ${doc.id}`);
          });
        }
      } catch (error) {
        console.log(`  ${keepCollection}: Collection not found`);
      }
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the cleanup
cleanupUnusedDocuments();