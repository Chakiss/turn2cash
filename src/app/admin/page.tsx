'use client';

import { useState, useEffect } from 'react';
import { getLeads, updateLeadStatus, getLeadStats } from '@/lib/leadService';
import { trackEvent } from '@/lib/firebase';
import type { Lead, LeadStatus } from '@/types';

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  completed: number;
  rejected: number;
  conversionRate: number;
}

const statusMap = {
  NEW: 'ใหม่',
  CONTACTED: 'ติดต่อแล้ว',
  PICKUP: 'รับซื้อ',
  COMPLETED: 'สำเร็จ',
  REJECTED: 'ยกเลิก'
};

const statusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'PICKUP', 'COMPLETED', 'REJECTED'];

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    trackEvent('admin_login');
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, statsData] = await Promise.all([
        getLeads(),
        getLeadStats()
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      setUpdating(leadId);
      await updateLeadStatus(leadId, newStatus);
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      // Refresh stats
      const statsData = await getLeadStats();
      setStats(statsData);
      
      trackEvent('lead_updated', {
        lead_id: leadId,
        old_status: leads.find(l => l.id === leadId)?.status,
        new_status: newStatus
      });
    } catch (error) {
      console.error('Failed to update lead:', error);
      alert('ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่');
    } finally {
      setUpdating(null);
    }
  };

  const filteredLeads = leads.filter(lead => 
    filterStatus === 'ALL' || lead.status === filterStatus
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (min: number, max: number) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()} ฿`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-neutral-text-secondary">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gradient-text">
              Turn2Cash Admin
            </h1>
            <button
              onClick={loadData}
              className="btn-outline"
            >
              🔄 รีเฟรช
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-neutral-border">
              <div className="text-2xl font-bold text-secondary-blue">{stats.total}</div>
              <div className="text-sm text-neutral-text-secondary">ทั้งหมด</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border border-secondary-blue">
              <div className="text-2xl font-bold text-secondary-blue">{stats.new}</div>
              <div className="text-sm text-neutral-text-secondary">รอดำเนินการ</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border border-accent-orange">
              <div className="text-2xl font-bold text-accent-orange">{stats.contacted}</div>
              <div className="text-sm text-neutral-text-secondary">ติดต่อแล้ว</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border border-primary-green">
              <div className="text-2xl font-bold text-primary-green">{stats.completed}</div>
              <div className="text-sm text-neutral-text-secondary">สำเร็จ</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-4 border border-accent-gold">
              <div className="text-2xl font-bold text-accent-gold">{stats.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-neutral-text-secondary">อัตราสำเร็จ</div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-neutral-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-text-secondary mr-2">กรอง:</span>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'ALL' 
                  ? 'bg-primary-green text-white' 
                  : 'bg-neutral-bg-light text-neutral-text-secondary hover:bg-neutral-border'
              }`}
            >
              ทั้งหมด ({leads.length})
            </button>
            {statusOptions.map(status => {
              const count = leads.filter(lead => lead.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status 
                      ? 'bg-primary-green text-white' 
                      : 'bg-neutral-bg-light text-neutral-text-secondary hover:bg-neutral-border'
                  }`}
                >
                  {statusMap[status]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-bg-light border-b border-neutral-border">
                <tr>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-text-primary">
                    ข้อมูลลูกค้า
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-text-primary">
                    อุปกรณ์
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-text-primary">
                    ราคาประเมิน
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-text-primary">
                    สถานะ
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-text-primary">
                    วันที่
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-neutral-text-primary">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-text-secondary">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-neutral-border hover:bg-neutral-bg-light">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-neutral-text-primary">{lead.name}</div>
                        <div className="text-sm text-neutral-text-secondary">{lead.phone}</div>
                        {lead.line_id && (
                          <div className="text-sm text-neutral-text-secondary">LINE: {lead.line_id}</div>
                        )}
                        <div className="text-xs text-neutral-text-secondary mt-1 max-w-xs truncate">
                          {lead.address}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-neutral-text-primary">
                          {lead.device.brand} {lead.device.model}
                        </div>
                        <div className="text-sm text-neutral-text-secondary">
                          {lead.device.storage} • {lead.device.condition}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-accent-gold">
                          {formatPrice(lead.price_min, lead.price_max)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                          {statusMap[lead.status]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-text-secondary">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusUpdate(lead.id, e.target.value as LeadStatus)}
                          disabled={updating === lead.id}
                          className="text-sm border border-neutral-border rounded px-2 py-1 bg-white disabled:opacity-50"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {statusMap[status]}
                            </option>
                          ))}
                        </select>
                        {updating === lead.id && (
                          <div className="inline-block ml-2">
                            <div className="spinner w-4 h-4" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}