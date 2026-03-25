import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { getDB } from './firebase';
import type { Lead, LeadFormData, LeadStatus } from '@/types';

const LEADS_COLLECTION = 'leads';

// Generate custom document ID in format L{{year}}{{month}}{{date}}{{time}}
function generateLeadId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `L${year}${month}${date}${hours}${minutes}${seconds}`;
}

// Create a new lead
export async function createLead(formData: LeadFormData): Promise<string> {
  try {
    const db = await getDB();
    if (!db) {
      // Fallback: Generate a mock ID for development/testing
      console.warn('Database not available, using mock lead ID');
      const mockId = generateLeadId();
      return mockId;
    }

    // Generate custom document ID
    const leadId = generateLeadId();

    const leadData: Omit<Lead, 'id'> = {
      name: formData.name,
      phone: formData.phone,
      line_id: formData.line_id || '',
      address: formData.address,
      device: formData.device,
      price_min: formData.price_estimate[0],
      price_max: formData.price_estimate[1],
      images: [], // Will be populated after image upload
      status: 'NEW' as LeadStatus,
      created_at: new Date(),
    };

    // Use setDoc instead of addDoc to specify custom ID
    await setDoc(doc(db, LEADS_COLLECTION, leadId), {
      ...leadData,
      created_at: Timestamp.fromDate(leadData.created_at)
    });

    console.log('Lead created with ID:', leadId);
    return leadId;
  } catch (error) {
    console.error('Error creating lead:', error);
    // Return mock ID as final fallback
    const fallbackId = generateLeadId();
    console.warn('Using fallback lead ID:', fallbackId);
    return fallbackId;
  }
}

// Get all leads (for admin)
export async function getLeads(): Promise<Lead[]> {
  try {
    console.log('🔍 Getting leads from Firestore...');
    const db = await getDB();
    if (!db) {
      console.warn('Database not available');
      return [];
    }

    const q = query(
      collection(db, LEADS_COLLECTION), 
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Firestore query returned:', querySnapshot.size, 'documents');
    
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        console.log('📄 Processing lead document:', doc.id, data);
        
        // Handle different date formats from Firestore
        let createdAt: Date;
        if (data.created_at?.toDate) {
          // Firestore Timestamp
          createdAt = data.created_at.toDate();
        } else if (data.created_at instanceof Date) {
          // Already a Date object
          createdAt = data.created_at;
        } else if (typeof data.created_at === 'string') {
          // String date
          createdAt = new Date(data.created_at);
        } else {
          // Fallback to current date
          console.warn('Invalid created_at format for lead:', doc.id);
          createdAt = new Date();
        }
        
        const lead: Lead = {
          id: doc.id,
          name: data.name || '',
          phone: data.phone || '',
          line_id: data.line_id || '',
          address: data.address || '',
          device: data.device || { brand: '', model: '', storage: '', condition: 'good' },
          price_min: data.price_min || 0,
          price_max: data.price_max || 0,
          images: data.images || [],
          status: data.status || 'NEW',
          created_at: createdAt
        };
        
        leads.push(lead);
        console.log('✅ Successfully processed lead:', lead.name);
      } catch (docError) {
        console.error('❌ Error processing lead document:', doc.id, docError);
      }
    });
    
    console.log('📊 Total leads processed:', leads.length);
    return leads;
  } catch (error) {
    console.error('❌ Error getting leads:', error);
    // Return empty array instead of throwing to avoid breaking UI
    return [];
  }
}

// Get leads by status
export async function getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  try {
    console.log('🔍 Getting leads by status:', status);
    const db = await getDB();
    if (!db) return [];

    const q = query(
      collection(db, LEADS_COLLECTION),
      where('status', '==', status),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Firestore query returned:', querySnapshot.size, 'documents for status:', status);
    
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
        // Handle different date formats from Firestore
        let createdAt: Date;
        if (data.created_at?.toDate) {
          createdAt = data.created_at.toDate();
        } else if (data.created_at instanceof Date) {
          createdAt = data.created_at;
        } else if (typeof data.created_at === 'string') {
          createdAt = new Date(data.created_at);
        } else {
          createdAt = new Date();
        }
        
        leads.push({
          id: doc.id,
          name: data.name || '',
          phone: data.phone || '',
          line_id: data.line_id || '',
          address: data.address || '',
          device: data.device || { brand: '', model: '', storage: '', condition: 'good' },
          price_min: data.price_min || 0,
          price_max: data.price_max || 0,
          images: data.images || [],
          status: data.status || 'NEW',
          created_at: createdAt
        });
      } catch (docError) {
        console.error('❌ Error processing lead document by status:', doc.id, docError);
      }
    });
    
    console.log('📊 Total leads processed by status:', leads.length);
    return leads;
  } catch (error) {
    console.error('❌ Error getting leads by status:', error);
    return [];
  }
}

// Update lead status
export async function updateLeadStatus(leadId: string, newStatus: LeadStatus): Promise<void> {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    await updateDoc(leadRef, {
      status: newStatus,
      updated_at: Timestamp.fromDate(new Date())
    });
    console.log('Lead status updated:', leadId, newStatus);
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Failed to update lead status');
  }
}

// Get lead by ID
export async function getLeadById(leadId: string): Promise<Lead | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    const docSnap = await getDoc(leadRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        phone: data.phone,
        line_id: data.line_id,
        address: data.address,
        device: data.device,
        price_min: data.price_min,
        price_max: data.price_max,
        images: data.images || [],
        status: data.status,
        created_at: data.created_at.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting lead by ID:', error);
    return null;
  }
}

// Get lead statistics
export async function getLeadStats() {
  try {
    console.log('📊 Getting lead statistics...');
    const db = await getDB();
    if (!db) {
      console.warn('Database not available for stats');
      return {
        total: 0,
        new: 0,
        contacted: 0,
        completed: 0,
        rejected: 0,
        conversionRate: 0
      };
    }

    const querySnapshot = await getDocs(collection(db, LEADS_COLLECTION));
    console.log('📊 Stats query returned:', querySnapshot.size, 'documents');
    
    let total = 0;
    let newLeads = 0;
    let contacted = 0;
    let completed = 0;
    let rejected = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      total++;
      
      console.log('Processing lead for stats:', doc.id, 'status:', data.status);
      
      switch (data.status) {
        case 'NEW':
          newLeads++;
          break;
        case 'CONTACTED':
          contacted++;
          break;
        case 'PICKUP':
          // Treat PICKUP as contacted for stats
          contacted++;
          break;
        case 'COMPLETED':
          completed++;
          break;
        case 'REJECTED':
          rejected++;
          break;
        default:
          console.warn('Unknown status:', data.status, 'for lead:', doc.id);
          newLeads++; // Default to new
      }
    });
    
    const conversionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const stats = {
      total,
      new: newLeads,
      contacted,
      completed,
      rejected,
      conversionRate
    };
    
    console.log('📊 Lead statistics calculated:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting lead stats:', error);
    // Return default stats to avoid breaking UI
    return {
      total: 0,
      new: 0,
      contacted: 0,
      completed: 0,
      rejected: 0,
      conversionRate: 0
    };
  }
}

// Update lead images
export async function updateLeadImages(leadId: string, imageUrls: string[]): Promise<void> {
  try {
    const db = await getDB();
    if (!db) throw new Error('Database not available');

    const leadRef = doc(db, LEADS_COLLECTION, leadId);
    await updateDoc(leadRef, {
      images: imageUrls,
      updated_at: Timestamp.fromDate(new Date())
    });
    console.log('Lead images updated:', leadId);
  } catch (error) {
    console.error('Error updating lead images:', error);
    throw new Error('Failed to update lead images');
  }
}
