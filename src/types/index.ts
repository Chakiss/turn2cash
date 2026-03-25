// Device Types
export interface Device {
  brand: string;
  model: string;
  storage: string;
  condition: 'good' | 'fair' | 'bad';
}

// Pricing Types
export interface PriceRange {
  min: number;
  max: number;
}

export interface DevicePrice {
  [storage: string]: {
    [condition: string]: [number, number]; // [min, max]
  };
}

export interface PricingData {
  [model: string]: DevicePrice;
}

// Transaction Types
export type TransactionType = 
  | 'initial_quote'
  | 'contact_initiated' 
  | 'item_pickup'
  | 'payment_completed'
  | 'deal_rejected';

export interface Transaction {
  id: string;
  lead_id: string;
  type: TransactionType;
  timestamp: Date;
  amount?: number; // Actual transaction amount (if applicable)
  estimated_amount?: number; // Estimated amount
  status: 'pending' | 'completed' | 'failed';
  details: {
    device?: Device;
    pickup_date?: Date;
    payment_method?: string;
    rejection_reason?: string;
    notes?: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  avg_transaction: number;
  successful_deals: number;
  pending_deals: number;
  rejection_rate: number;
}

// Lead Types
export interface Lead {
  id: string;
  name: string;
  phone: string;
  line_id: string;
  address: string;
  device: Device;
  price_min: number;
  price_max: number;
  images: string[];
  status: LeadStatus;
  created_at: Date;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'PICKUP' | 'COMPLETED' | 'REJECTED';

// Form Types
export interface LeadFormData {
  name: string;
  phone: string;
  line_id: string;
  address: string;
  device: Device;
  price_estimate: [number, number];
  images: File[];
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  lead_id?: string;
}

// Analytics Event Types
export type AnalyticsEvent = 
  | 'page_view'
  | 'estimate_started'
  | 'estimate_completed'
  | 'form_started'
  | 'form_submitted'
  | 'admin_login'
  | 'lead_updated'
  | 'device_added'
  | 'device_updated'
  | 'device_deleted'
  | 'device_status_toggled'
  | 'sample_data_added';

// Brand and Model Data
export interface BrandData {
  name: string;
  models: string[];
  storageOptions: string[];
}

// Device Management Types (for Admin)
export interface DeviceModel {
  id: string;
  brand: string;
  model: string;
  storage_options: string[];
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DeviceFormData {
  brand: string;
  model: string;
  storage_options: string[];
  active?: boolean;
}

export interface BrandInfo {
  name: string;
  device_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface DevicePricingData {
  [storage: string]: {
    [condition: string]: {
      min: number;
      max: number;
    };
  };
}

export interface EstimateStep {
  step: number;
  title: string;
  completed: boolean;
  current: boolean;
}
