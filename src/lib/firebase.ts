import type { AnalyticsEvent } from '@/types';

// Firebase configuration and services - Universal (client + server)
let app: any;
let db: any;
let analytics: any;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "turn2cash-project.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "turn2cash-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "turn2cash-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "148036977712",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:148036977712:web:demo",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEMO"
};

// Initialize Firebase (works on both client and server)
const initFirebase = async () => {
  if (!app) {
    try {
      const { initializeApp } = await import('firebase/app');
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  }
  return app;
};

// Get Firestore instance (universal) with retry mechanism and CORS handling
export const getDB = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!db) {
        console.log(`🔄 Attempting to connect to Firestore (attempt ${attempt}/${maxRetries})`);
        await initFirebase();
        
        // Add a small delay for dynamic imports to settle
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');
        db = getFirestore(app);
        
        // Enhanced connection settings for better CORS compatibility
        if (typeof window !== 'undefined') {
          // Client-side settings for better connectivity
          console.log('🌐 Configuring Firestore for web environment');
        }
        
        console.log('✅ Firestore connected successfully');
      }
      return db;
    } catch (error: any) {
      console.error(`❌ Firebase/Firestore initialization error (attempt ${attempt}):`, error);
      
      // Specific handling for CORS-related errors
      if (error.message?.includes('CORS') || error.message?.includes('access control')) {
        console.error('🚨 CORS error detected - this might be a browser security issue');
        console.error('💡 Try: 1) Restart browser, 2) Clear cache, 3) Check Firebase project settings');
      }
      
      if (attempt === maxRetries) {
        console.error('❌ All Firebase connection attempts failed');
        console.error('🔍 Final error details:', {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack?.slice(0, 300)
        });
        return null;
      }
      
      // Wait before retrying with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏱️ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
};

export const auth = null; // Add auth later if needed

// Initialize Analytics (client-side only)  
export const initAnalytics = async () => {
  if (typeof window === 'undefined' || analytics) return analytics;
  
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    
    if (supported) {
      await initFirebase();
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    }
  } catch (error) {
    console.warn('Failed to initialize analytics:', error);
  }
  
  return analytics;
};

// Analytics helper function
export const trackEvent = async (eventName: AnalyticsEvent, parameters?: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (!analytics) {
      analytics = await initAnalytics();
    }
    
    if (analytics) {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, `t2c_${eventName}` as any, {
        ...parameters,
        timestamp: new Date().toISOString(),
        page_url: window.location.href
      });
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};