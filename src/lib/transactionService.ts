import { 
  collection, 
  doc, 
  addDoc, 
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
import type { Transaction, TransactionType, TransactionSummary, Device } from '@/types';

const TRANSACTIONS_COLLECTION = 'transactions';

// Create a new transaction
export const createTransaction = async (
  leadId: string,
  type: TransactionType,
  details: {
    device?: Device;
    estimated_amount?: number;
    amount?: number;
    pickup_date?: Date;
    payment_method?: string;
    rejection_reason?: string;
    notes?: string;
  }
): Promise<string> => {
  try {
    const db = await getDB();
    if (!db) {
      // Fallback: Generate a mock transaction ID
      console.warn('Database not available, using mock transaction ID');
      const mockId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return mockId;
    }

    const transaction: Omit<Transaction, 'id'> = {
      lead_id: leadId,
      type,
      timestamp: new Date(),
      amount: details.amount,
      estimated_amount: details.estimated_amount,
      status: type === 'payment_completed' ? 'completed' : 'pending',
      details,
      created_at: new Date(),
      updated_at: new Date()
    };

    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transaction,
      timestamp: Timestamp.fromDate(transaction.timestamp),
      created_at: Timestamp.fromDate(transaction.created_at),
      updated_at: Timestamp.fromDate(transaction.updated_at),
      details: {
        ...details,
        pickup_date: details.pickup_date ? Timestamp.fromDate(details.pickup_date) : undefined
      }
    });

    console.log('Transaction created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    // Return fallback transaction ID instead of throwing
    const fallbackId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.warn('Using fallback transaction ID:', fallbackId);
    return fallbackId;
  }
};

// Update transaction status
export const updateTransactionStatus = async (
  transactionId: string, 
  status: 'pending' | 'completed' | 'failed',
  amount?: number
): Promise<void> => {
  try {    const db = await getDB();
    if (!db) throw new Error('Database not available');
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const updates: any = {
      status,
      updated_at: Timestamp.fromDate(new Date())
    };
    
    if (amount !== undefined) {
      updates.amount = amount;
    }

    await updateDoc(transactionRef, updates);
    console.log('Transaction updated:', transactionId);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }
};

// Get all transactions for a specific lead
export const getTransactionsByLead = async (leadId: string): Promise<Transaction[]> => {
  try {
    const db = await getDB();
    if (!db) return [];

    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('lead_id', '==', leadId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        lead_id: data.lead_id,
        type: data.type,
        timestamp: data.timestamp.toDate(),
        amount: data.amount,
        estimated_amount: data.estimated_amount,
        status: data.status,
        details: {
          ...data.details,
          pickup_date: data.details.pickup_date ? data.details.pickup_date.toDate() : undefined
        },
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions by lead:', error);
    throw new Error('Failed to fetch transactions');
  }
};

// Get all transactions (with pagination)
export const getTransactions = async (limitCount: number = 50): Promise<Transaction[]> => {
  try {
    const db = await getDB();
    if (!db) return [];

    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        lead_id: data.lead_id,
        type: data.type,
        timestamp: data.timestamp.toDate(),
        amount: data.amount,
        estimated_amount: data.estimated_amount,
        status: data.status,
        details: {
          ...data.details,
          pickup_date: data.details.pickup_date ? data.details.pickup_date.toDate() : undefined
        },
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return []; // Return empty array instead of throwing to avoid breaking UI
  }
};

// Get transaction summary/statistics
export const getTransactionSummary = async (): Promise<TransactionSummary> => {
  try {
    const db = await getDB();
    if (!db) {
      return {
        total_transactions: 0,
        total_amount: 0,
        avg_transaction: 0,
        successful_deals: 0,
        pending_deals: 0,
        rejection_rate: 0
      };
    }

    const querySnapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    let totalTransactions = 0;
    let totalAmount = 0;
    let successfulDeals = 0;
    let pendingDeals = 0;
    let rejectedDeals = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalTransactions++;
      
      if (data.amount) {
        totalAmount += data.amount;
      }
      
      if (data.status === 'completed') {
        successfulDeals++;
      } else if (data.status === 'pending') {
        pendingDeals++;
      } else if (data.type === 'deal_rejected') {
        rejectedDeals++;
      }
    });
    
    return {
      total_transactions: totalTransactions,
      total_amount: totalAmount,
      avg_transaction: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
      successful_deals: successfulDeals,
      pending_deals: pendingDeals,
      rejection_rate: totalTransactions > 0 ? (rejectedDeals / totalTransactions) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    // Return default values instead of throwing
    return {
      total_transactions: 0,
      total_amount: 0,
      avg_transaction: 0,
      successful_deals: 0,
      pending_deals: 0,
      rejection_rate: 0
    };
  }
};

// Get transactions by type
export const getTransactionsByType = async (type: TransactionType): Promise<Transaction[]> => {
  try {
    const db = await getDB();
    if (!db) return [];

    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('type', '==', type),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        lead_id: data.lead_id,
        type: data.type,
        timestamp: data.timestamp.toDate(),
        amount: data.amount,
        estimated_amount: data.estimated_amount,
        status: data.status,
        details: {
          ...data.details,
          pickup_date: data.details.pickup_date ? data.details.pickup_date.toDate() : undefined
        },
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate()
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions by type:', error);
    return [];
  }
};

// Helper function to create initial quote transaction when lead is created
export const createInitialQuoteTransaction = async (
  leadId: string,
  device: Device,
  estimatedMin: number, 
  estimatedMax: number
): Promise<string> => {
  const avgEstimate = (estimatedMin + estimatedMax) / 2;
  
  return createTransaction(leadId, 'initial_quote', {
    device,
    estimated_amount: avgEstimate,
    notes: `Price estimate: ${estimatedMin.toLocaleString()} - ${estimatedMax.toLocaleString()} THB`
  });
};

// Helper function to create pickup transaction with actual price
export const createPickupTransaction = async (
  leadId: string,
  actualPrice: number,
  pickupDate?: Date,
  notes?: string
): Promise<string> => {
  return createTransaction(leadId, 'item_pickup', {
    amount: actualPrice,
    pickup_date: pickupDate || new Date(),
    notes
  });
};

// Helper function to create payment completion transaction
export const createPaymentTransaction = async (
  leadId: string,
  amount: number,
  paymentMethod: string = 'cash'
): Promise<string> => {
  return createTransaction(leadId, 'payment_completed', {
    amount,
    payment_method: paymentMethod,
    notes: `Payment completed via ${paymentMethod}`
  });
};