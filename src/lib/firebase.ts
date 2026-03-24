import type { AnalyticsEvent } from '@/types';

// Mock Firebase for development - replace with actual Firebase when ready
const mockApp = {};

// Mock services for development
export const db = {};
export const storage = {};
export const auth = {};

// Initialize Analytics (client-side only)
export const initAnalytics = () => {
  if (typeof window !== 'undefined') {
    console.log('Analytics initialized (mock)');
    return mockApp;
  }
  return null;
};

// Analytics helper function
export const trackEvent = (eventName: AnalyticsEvent, parameters?: any) => {
  if (typeof window !== 'undefined') {
    console.log('Track event:', eventName, parameters);
    // In development, just log events
    // In production, this would use real Firebase Analytics
  }
};

export default mockApp;