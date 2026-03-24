import type { Lead, LeadFormData, LeadStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock lead service for development
// Replace with actual Firestore implementation when Firebase is configured

let mockLeads: Lead[] = [];

// Create a new lead
export async function createLead(formData: LeadFormData): Promise<string> {
  try {
    const leadId = uuidv4();
    const leadData: Lead = {
      id: leadId,
      name: formData.name,
      phone: formData.phone,
      line_id: formData.line_id,
      address: formData.address,
      device: formData.device,
      price_min: formData.price_estimate[0],
      price_max: formData.price_estimate[1],
      images: [], // Will be populated after image upload
      status: 'NEW' as LeadStatus,
      created_at: new Date(),
    };

    // Store in memory (in production, this would go to Firestore)
    mockLeads.push(leadData);
    console.log('Created lead:', leadData);
    
    return leadId;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Failed to create lead');
  }
}

// Get all leads (for admin)
export async function getLeads(): Promise<Lead[]> {
  try {
    // Return mock data sorted by created_at desc
    return [...mockLeads].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  } catch (error) {
    console.error('Error getting leads:', error);
    throw new Error('Failed to fetch leads');
  }
}

// Get leads by status
export async function getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  try {
    return mockLeads
      .filter(lead => lead.status === status)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  } catch (error) {
    console.error('Error getting leads by status:', error);
    throw new Error('Failed to fetch leads by status');
  }
}

// Update lead status
export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  try {
    const leadIndex = mockLeads.findIndex(lead => lead.id === leadId);
    if (leadIndex === -1) {
      throw new Error('Lead not found');
    }

    mockLeads[leadIndex].status = status;
    console.log('Updated lead status:', leadId, status);
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Failed to update lead status');
  }
}

// Get lead statistics for admin dashboard
export async function getLeadStats() {
  try {
    const allLeads = await getLeads();
    const newLeads = await getLeadsByStatus('NEW');
    const contactedLeads = await getLeadsByStatus('CONTACTED');
    const completedLeads = await getLeadsByStatus('COMPLETED');
    const rejectedLeads = allLeads.filter(lead => lead.status === 'REJECTED');

    return {
      total: allLeads.length,
      new: newLeads.length,
      contacted: contactedLeads.length,
      completed: completedLeads.length,
      rejected: rejectedLeads.length,
      conversionRate: allLeads.length > 0 ? (completedLeads.length / allLeads.length) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting lead stats:', error);
    throw new Error('Failed to fetch lead statistics');
  }
}