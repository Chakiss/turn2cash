'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLeads, updateLeadStatus, getLeadStats } from '@/lib/leadService';
import {
  getAllDevices,
  getAllBrands,
  createDevice,
  updateDevice,
  deleteDevice,
  toggleDeviceStatus
} from '@/lib/deviceService';
import { addSampleDataToFirestore } from '@/lib/addSampleData';
import { trackEvent } from '@/lib/firebase';
import type { Lead, LeadStatus, Device, PricingData, DeviceModel, DeviceFormData, BrandInfo } from '@/types';
import FirebaseErrorBoundary from '@/components/FirebaseErrorBoundary';

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  completed: number;
  rejected: number;
  conversionRate: number;
}

interface PricingEntry {
  model: string;
  storage: string;
  condition: 'good' | 'fair' | 'bad';
  min_price: number;
  max_price: number;
}

const statusMap = {
  NEW: 'ใหม่',
  CONTACTED: 'ติดต่อแล้ว',
  PICKUP: 'รับซื้อ',
  COMPLETED: 'สำเร็จ',
  REJECTED: 'ยกเลิก'
};

const statusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'PICKUP', 'COMPLETED', 'REJECTED'];

const conditionMap = {
  good: 'สภาพดี',
  fair: 'สภาพปานกลาง', 
  bad: 'สภาพเก่า'
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'leads' | 'devices' | 'pricing'>('leads');
  
  // Lead management state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL');
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Device management state
  const [devices, setDevices] = useState<DeviceModel[]>([]);
  const [brands, setBrands] = useState<BrandInfo[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceUpdating, setDeviceUpdating] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showEditDevice, setShowEditDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceModel | null>(null);
  const [newDevice, setNewDevice] = useState<DeviceFormData>({
    brand: '',
    model: '',
    storage_options: ['64GB', '128GB', '256GB'],
    active: true
  });
  
  // Pricing management state
  const [pricing, setPricing] = useState<PricingEntry[]>([]);
  const [showAddPricing, setShowAddPricing] = useState(false);
  const [newPricing, setNewPricing] = useState({
    model: '',
    storage: '',
    condition: 'good' as const,
    min_price: 0,
    max_price: 0
  });

  // Load devices and brands data
  const loadDevicesData = useCallback(async () => {
    try {
      setDeviceLoading(true);
      console.log('📱 Loading devices from Firestore...');
      
      const [devicesData, brandsData] = await Promise.all([
        getAllDevices(),
        getAllBrands()
      ]);
      
      console.log('📱 Devices loaded:', devicesData.length);
      console.log('🏢 Brands loaded:', brandsData.length);
      
      setDevices(devicesData);
      setBrands(brandsData);
      
      console.log('✅ Device data loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load devices data:', error);
      alert('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้ กรุณาลองใหม่');
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting to load admin data...');
      
      const [leadsData, statsData] = await Promise.all([
        getLeads(),
        getLeadStats()
      ]);
      
      console.log('👥 Leads loaded:', leadsData.length);
      console.log('📊 Stats loaded:', statsData);
      
      setLeads(leadsData);
      setStats(statsData);
      
      // Load device and brand data from Firebase
      console.log('📱 Loading devices and brands...');
      await loadDevicesData();
      
      // Load mock pricing data - to be implemented later
      setPricing([
        { model: 'iPhone 13', storage: '128GB', condition: 'good', min_price: 20000, max_price: 22000 },
        { model: 'iPhone 13', storage: '128GB', condition: 'fair', min_price: 18000, max_price: 20000 },
        { model: 'iPhone 13', storage: '128GB', condition: 'bad', min_price: 15000, max_price: 18000 }
      ]);
      
      console.log('✅ All admin data loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }, [loadDevicesData]);

  useEffect(() => {
    loadData();
    trackEvent('admin_login');
  }, [loadData]);

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      setUpdating(leadId);
      await updateLeadStatus(leadId, newStatus);
      
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
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

  const handleAddDevice = async () => {
    try {
      if (!newDevice.brand.trim() || !newDevice.model.trim()) {
        alert('กรุณากรอกยี่ห้อและรุ่นของอุปกรณ์');
        return;
      }

      if (newDevice.storage_options.length === 0) {
        alert('กรุณาระบุความจุอย่างน้อย 1 ตัวเลือก');
        return;
      }

      setDeviceLoading(true);
      
      await createDevice({
        brand: newDevice.brand.trim(),
        model: newDevice.model.trim(),
        storage_options: newDevice.storage_options.filter(s => s.trim() !== ''),
        active: true
      });
      
      // Reload devices data to show the new device
      await loadDevicesData();
      
      // Reset form
      setNewDevice({
        brand: '',
        model: '',
        storage_options: ['64GB', '128GB', '256GB'],
        active: true
      });
      setShowAddDevice(false);
      
      alert('เพิ่มอุปกรณ์เรียบร้อยแล้ว');
      
      trackEvent('device_added', {
        brand: newDevice.brand,
        model: newDevice.model
      });
    } catch (error) {
      console.error('Failed to add device:', error);
      alert(error instanceof Error ? error.message : 'ไม่สามารถเพิ่มอุปกรณ์ได้');
    } finally {
      setDeviceLoading(false);
    }
  };

  // Edit device
  const handleEditDevice = async () => {
    try {
      if (!editingDevice) return;

      if (!newDevice.brand.trim() || !newDevice.model.trim()) {
        alert('กรุณากรอกยี่ห้อและรุ่นของอุปกรณ์');
        return;
      }

      setDeviceLoading(true);
      
      await updateDevice(editingDevice.id, {
        brand: newDevice.brand.trim(),
        model: newDevice.model.trim(),
        storage_options: newDevice.storage_options.filter(s => s.trim() !== ''),
        active: newDevice.active
      });
      
      // Reload devices data to show the updated device
      await loadDevicesData();
      
      // Reset form
      setNewDevice({
        brand: '',
        model: '',
        storage_options: ['64GB', '128GB', '256GB'],
        active: true
      });
      setShowEditDevice(false);
      setEditingDevice(null);
      
      alert('อัปเดตอุปกรณ์เรียบร้อยแล้ว');
      
      trackEvent('device_updated', {
        device_id: editingDevice.id,
        brand: newDevice.brand,
        model: newDevice.model
      });
    } catch (error) {
      console.error('Failed to update device:', error);
      alert(error instanceof Error ? error.message : 'ไม่สามารถอัปเดตอุปกรณ์ได้');
    } finally {
      setDeviceLoading(false);
    }
  };

  // Delete device
  const handleDeleteDevice = async (deviceId: string, deviceName: string) => {
    try {
      if (!confirm(`คุณต้องการลบอุปกรณ์ "${deviceName}" หรือไม่?\n\nการลบจะไม่สามารถยกเลิกได้`)) {
        return;
      }

      setDeviceUpdating(deviceId);
      
      await deleteDevice(deviceId);
      
      // Reload devices data to reflect the deletion
      await loadDevicesData();
      
      alert('ลบอุปกรณ์เรียบร้อยแล้ว');
      
      trackEvent('device_deleted', {
        device_id: deviceId,
        device_name: deviceName
      });
    } catch (error) {
      console.error('Failed to delete device:', error);
      alert(error instanceof Error ? error.message : 'ไม่สามารถลบอุปกรณ์ได้');
    } finally {
      setDeviceUpdating(null);
    }
  };

  // Toggle device status
  const handleToggleDeviceStatus = async (deviceId: string, currentStatus: boolean) => {
    try {
      setDeviceUpdating(deviceId);
      
      await toggleDeviceStatus(deviceId);
      
      // Reload devices data to reflect the status change
      await loadDevicesData();
      
      trackEvent('device_status_toggled', {
        device_id: deviceId,
        new_status: !currentStatus
      });
    } catch (error) {
      console.error('Failed to toggle device status:', error);
      alert(error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะอุปกรณ์ได้');
    } finally {
      setDeviceUpdating(null);
    }
  };

  // Open edit device modal
  const openEditDevice = (device: DeviceModel) => {
    setEditingDevice(device);
    setNewDevice({
      brand: device.brand,
      model: device.model,
      storage_options: [...device.storage_options],
      active: device.active
    });
    setShowEditDevice(true);
  };

  // Add sample data for testing
  const handleAddSampleData = async () => {
    try {
      if (!confirm('เพิ่มข้อมูลตัวอย่างลงฐานข้อมูล? (อุปกรณ์ 6 รายการ + ลีด 4 รายการ)')) {
        return;
      }

      setLoading(true);
      await addSampleDataToFirestore();
      
      // Reload all data
      await loadData();
      
      alert('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว!');
      
      trackEvent('sample_data_added');
    } catch (error) {
      console.error('Failed to add sample data:', error);
      alert(error instanceof Error ? error.message : 'ไม่สามารถเพิ่มข้อมูลตัวอย่างได้');
    }
  };

  // Debug function to test database connectivity  
  const handleTestDatabase = async () => {
    try {
      setLoading(true);
      console.log('🧪 Testing database connectivity...');
      
      // Test direct database access
      const testLeads = await getLeads();
      const testStats = await getLeadStats();
      const testDevices = await getAllDevices();
      
      alert(`🧪 Database Test Results:
      - Leads: ${testLeads.length}
      - Devices: ${testDevices.length}
      - Stats Total: ${testStats.total}
      
      Check console for detailed logs.`);
      
      console.log('🧪 Test Results:');
      console.log('Leads:', testLeads);
      console.log('Stats:', testStats);
      console.log('Devices:', testDevices);
      
    } catch (error) {
      console.error('❌ Database test failed:', error);
      alert('❌ Database test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPricing = async () => {
    try {
      // Add pricing logic - replace with real API call
      setPricing(prev => [...prev, newPricing]);
      setNewPricing({
        model: '',
        storage: '',
        condition: 'good',
        min_price: 0,
        max_price: 0
      });
      setShowAddPricing(false);
      
      alert('เพิ่มราคาเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Failed to add pricing:', error);
      alert('ไม่สามารถเพิ่มราคาได้');
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Turn2Cash Admin
            </h1>
            <div className="flex space-x-3">
              {/* Add Sample Data button (only show if no data) */}
              {(!leads || leads.length === 0) && (
                <button
                  onClick={handleAddSampleData}
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  📝 เพิ่มข้อมูลตัวอย่าง
                </button>
              )}
              <button
                onClick={handleTestDatabase}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                🧪 ทดสอบฐานข้อมูล
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                🔄 รีเฟรช
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leads' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              จัดการลีด
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              จัดการอุปกรณ์
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pricing' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              จัดการราคา
            </button>
          </nav>
        </div>

        {/* Lead Management Tab */}
        {activeTab === 'leads' && (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4 border">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-500">ทั้งหมด</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                  <div className="text-sm text-gray-500">รอดำเนินการ</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats.contacted}</div>
                  <div className="text-sm text-gray-500">ติดต่อแล้ว</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-500">สำเร็จ</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{stats.conversionRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">อัตราสำเร็จ</div>
                </div>
              </div>
            )}

            {/* Filter */}
            <div className="mb-6">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'ALL')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="ALL">ทุกสถานะ</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {statusMap[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {filteredLeads.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-600">
                    {leads.length === 0 ? 'ยังไม่มีลีดในระบบ' : 'ไม่พบลีดที่ตรงกับการกรอง'}
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    {leads.length === 0 && 'ลองเพิ่มข้อมูลตัวอย่างผ่านหน้า /test-data'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ลูกค้า
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        อุปกรณ์
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ราคา
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.phone}</div>
                            {lead.line_id && (
                              <div className="text-sm text-gray-500">Line: {lead.line_id}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.device.brand} {lead.device.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.device.storage} • {lead.device.condition}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(lead.price_min, lead.price_max)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                            lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                            lead.status === 'PICKUP' ? 'bg-purple-100 text-purple-800' :
                            lead.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {statusMap[lead.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusUpdate(lead.id, e.target.value as LeadStatus)}
                            disabled={updating === lead.id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>
                                {statusMap[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Device Management Tab */}
        {activeTab === 'devices' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <button
                  onClick={() => setShowAddDevice(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  disabled={deviceLoading}
                >
                  + เพิ่มอุปกรณ์ใหม่
                </button>
              </div>
              
              {/* Brand Summary */}
              <div className="text-sm text-gray-600">
                {brands.length > 0 && (
                  <span>ยี่ห้อทั้งหมด: {brands.length} | อุปกรณ์ทั้งหมด: {devices.length}</span>
                )}
              </div>
            </div>

            {/* Add Device Modal */}
            {showAddDevice && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">เพิ่มอุปกรณ์ใหม่</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยี่ห้อ
                      </label>
                      <input
                        type="text"
                        value={newDevice.brand}
                        onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="เช่น Apple, Samsung"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รุ่น
                      </label>
                      <input
                        type="text"
                        value={newDevice.model}
                        onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="เช่น iPhone 15, Galaxy S24"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ความจุที่รองรับ (คั่นด้วยจุลภาค)
                      </label>
                      <input
                        type="text"
                        value={newDevice.storage_options.join(', ')}
                        onChange={(e) => setNewDevice({
                          ...newDevice, 
                          storage_options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="64GB, 128GB, 256GB, 512GB"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleAddDevice}
                      disabled={deviceLoading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deviceLoading ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddDevice(false);
                        setNewDevice({
                          brand: '',
                          model: '',
                          storage_options: ['64GB', '128GB', '256GB'],
                          active: true
                        });
                      }}
                      disabled={deviceLoading}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Device Modal */}
            {showEditDevice && editingDevice && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">แก้ไขอุปกรณ์</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ยี่ห้อ
                      </label>
                      <input
                        type="text"
                        value={newDevice.brand}
                        onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="เช่น Apple, Samsung"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รุ่น
                      </label>
                      <input
                        type="text"
                        value={newDevice.model}
                        onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="เช่น iPhone 15, Galaxy S24"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ความจุที่รองรับ (คั่นด้วยจุลภาค)
                      </label>
                      <input
                        type="text"
                        value={newDevice.storage_options.join(', ')}
                        onChange={(e) => setNewDevice({
                          ...newDevice, 
                          storage_options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="64GB, 128GB, 256GB, 512GB"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newDevice.active}
                          onChange={(e) => setNewDevice({...newDevice, active: e.target.checked})}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">ใช้งานอุปกรณ์นี้</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleEditDevice}
                      disabled={deviceLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deviceLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                    <button
                      onClick={() => {
                        setShowEditDevice(false);
                        setEditingDevice(null);
                        setNewDevice({
                          brand: '',
                          model: '',
                          storage_options: ['64GB', '128GB', '256GB'],
                          active: true
                        });
                      }}
                      disabled={deviceLoading}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Devices Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {deviceLoading && !devices.length ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-neutral-600">กำลังโหลดข้อมูลอุปกรณ์...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-600">ยังไม่มีอุปกรณ์ในระบบ</p>
                  <p className="text-sm text-neutral-400 mt-2">คลิก "เพิ่มอุปกรณ์ใหม่" เพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ยี่ห้อ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          รุ่น
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ความจุที่รองรับ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          สถานะ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          วันที่อัปเดต
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          การจัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {devices.map(device => (
                        <tr key={device.id} className={deviceUpdating === device.id ? 'opacity-50' : ''}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{device.brand}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{device.model}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {device.storage_options.join(', ')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              device.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {device.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(device.updated_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleToggleDeviceStatus(device.id, device.active)}
                                disabled={deviceUpdating === device.id}
                                className="text-blue-600 hover:text-blue-900 text-sm disabled:opacity-50"
                              >
                                {device.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                              </button>
                              <span className="text-gray-300">|</span>
                              <button 
                                onClick={() => openEditDevice(device)}
                                disabled={deviceUpdating === device.id}
                                className="text-indigo-600 hover:text-indigo-900 text-sm disabled:opacity-50"
                              >
                                แก้ไข
                              </button>
                              <span className="text-gray-300">|</span>
                              <button 
                                onClick={() => handleDeleteDevice(device.id, `${device.brand} ${device.model}`)}
                                disabled={deviceUpdating === device.id}
                                className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pricing Management Tab */}
        {activeTab === 'pricing' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setShowAddPricing(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + เพิ่มราคาใหม่
              </button>
            </div>

            {/* Add Pricing Modal */}
            {showAddPricing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">เพิ่มราคาใหม่</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รุ่นอุปกรณ์
                      </label>
                      <select
                        value={newPricing.model}
                        onChange={(e) => setNewPricing({...newPricing, model: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="">เลือกรุ่น</option>
                        {devices.map(device => (
                          <option key={device.id} value={device.model}>
                            {device.brand} {device.model}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ความจุ
                      </label>
                      <select
                        value={newPricing.storage}
                        onChange={(e) => setNewPricing({...newPricing, storage: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="">เลือกความจุ</option>
                        {['64GB', '128GB', '256GB', '512GB', '1TB'].map(storage => (
                          <option key={storage} value={storage}>{storage}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        สภาพเครื่อง
                      </label>
                      <select
                        value={newPricing.condition}
                        onChange={(e) => setNewPricing({...newPricing, condition: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="good">สภาพดี</option>
                        <option value="fair">สภาพปานกลาง</option>
                        <option value="bad">สภาพเก่า</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ราคาต่ำสุด (฿)
                        </label>
                        <input
                          type="number"
                          value={newPricing.min_price}
                          onChange={(e) => setNewPricing({...newPricing, min_price: parseInt(e.target.value) || 0})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ราคาสูงสุด (฿)
                        </label>
                        <input
                          type="number"
                          value={newPricing.max_price}
                          onChange={(e) => setNewPricing({...newPricing, max_price: parseInt(e.target.value) || 0})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={handleAddPricing}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      เพิ่ม
                    </button>
                    <button
                      onClick={() => setShowAddPricing(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      รุ่น
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ความจุ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      สภาพเครื่อง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ราคา (฿)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pricing.map((price, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">{price.model}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{price.storage}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {conditionMap[price.condition]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatPrice(price.min_price, price.max_price)}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="text-red-600 hover:text-red-900 text-sm"
                          onClick={() => {
                            setPricing(pricing.filter((_, i) => i !== index));
                          }}
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Wrap with error boundary for chunk loading issues
export default function AdminDashboardWithErrorBoundary() {
  return (
    <FirebaseErrorBoundary
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">เกิดข้อผิดพลาดในการโหลดระบบ</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              รีโหลดหน้าเว็บ
            </button>
          </div>
        </div>
      }
    >
      <AdminDashboard />
    </FirebaseErrorBoundary>
  );
}
