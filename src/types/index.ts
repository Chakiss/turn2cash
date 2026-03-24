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
  | 'lead_updated';

// Brand and Model Data
export interface BrandData {
  name: string;
  models: string[];
  storageOptions: string[];
}

export interface EstimateStep {
  step: number;
  title: string;
  completed: boolean;
  current: boolean;
}
