'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPriceRange } from '@/lib/pricing-firestore';
import { trackEvent } from '@/lib/firebase';
import { createLead } from '@/lib/leadService';
import type { Device, LeadFormData } from '@/types';

export default function FormPage() {
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    line_id: '',
    address: '',
  });

  useEffect(() => {
    // Load device and price data
    const savedDevice = localStorage.getItem('selectedDevice');
    const savedPrice = localStorage.getItem('priceEstimate');
    
    if (savedDevice && savedPrice) {
      try {
        const deviceData = JSON.parse(savedDevice) as Device;
        const priceData = JSON.parse(savedPrice) as [number, number];
        setDevice(deviceData);
        setPriceEstimate(priceData);
        trackEvent('form_started', {
          brand: deviceData.brand,
          model: deviceData.model,
        });
      } catch (error) {
        router.push('/estimate');
      }
    } else {
      router.push('/estimate');
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'กรุณากรอกที่อยู่สำหรับรับซื้อ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !device || !priceEstimate) return;
    
    setLoading(true);
    
    try {
      const leadData: LeadFormData = {
        name: formData.name,
        phone: formData.phone,
        line_id: formData.line_id,
        address: formData.address,
        device,
        price_estimate: priceEstimate,
        images: [], // Will be implemented later
      };
      
      // Call Firebase directly (no API route needed for static export)
      const leadId = await createLead(leadData);
      
      if (leadId) {
        // Store lead ID for success page
        localStorage.setItem('leadId', leadId);
        trackEvent('form_submitted', {
          brand: device.brand,
          model: device.model,
          lead_id: leadId,
        });
        router.push('/success');
      } else {
        throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getConditionText = (condition: string) => {
    const conditionMap = {
      good: 'สภาพดี',
      fair: 'สภาพปานกลาง',
      bad: 'สภาพทั่วไป'
    };
    return conditionMap[condition as keyof typeof conditionMap] || condition;
  };

  if (!device || !priceEstimate) {
    return (
      <div className="min-h-screen bg-neutral-bg-light flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-neutral-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Turn2Cash
            </Link>
            <Link href="/result" className="btn-ghost">
              ← กลับ
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-neutral-text-primary mb-2">
            กรอกข้อมูลติดต่อ
          </h1>
          <p className="text-lg text-neutral-text-secondary">
            เราจะติดต่อคุณภายใน 1 ชั่วโมง
          </p>
        </div>

        {/* Device Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-text-primary">
                {device.brand} {device.model}
              </h3>
              <p className="text-neutral-text-secondary">
                {device.storage} • {getConditionText(device.condition)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-text-secondary">ราคารับซื้อ</div>
              <div className="text-lg font-bold text-accent-gold">
                {formatPriceRange({ min: priceEstimate[0], max: priceEstimate[1] })}
              </div>
            </div>
          </div>
          <div className="bg-primary-green-light p-3 rounded-lg border border-primary-green">
            <p className="text-sm text-primary-green font-medium">
              💡 ราคานี้เป็นราคาประเมินเบื้องต้น ราคาจริงจะขึ้นอยู่กับสภาพของเครื่อง
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
                ชื่อ-นามสกุล <span className="text-error-red">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                placeholder="ระบุชื่อ-นามสกุลของคุณ"
              />
              {errors.name && (
                <p className="text-error-red text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
                เบอร์โทรศัพท์ <span className="text-error-red">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`input-field ${errors.phone ? 'input-error' : ''}`}
                placeholder="08x-xxx-xxxx"
              />
              {errors.phone && (
                <p className="text-error-red text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* LINE ID */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
                LINE ID (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={formData.line_id}
                onChange={(e) => handleInputChange('line_id', e.target.value)}
                className="input-field"
                placeholder="@your-line-id"
              />
              <p className="text-sm text-neutral-text-secondary mt-1">
                สำหรับติดต่อและส่งรูปภาพ
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-neutral-text-primary mb-2">
                ที่อยู่สำหรับรับซื้อ <span className="text-error-red">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`input-field resize-none ${errors.address ? 'input-error' : ''}`}
                placeholder="บ้านเลขที่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              />
              {errors.address && (
                <p className="text-error-red text-sm mt-1">{errors.address}</p>
              )}
              <p className="text-sm text-neutral-text-secondary mt-1">
                เราจะไปรับซื้อถึงที่โดยไม่เสียค่าใช้จ่าย
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner w-5 h-5 mr-3" />
                    กำลังส่งข้อมูล...
                  </span>
                ) : (
                  'ส่งข้อมูล ขายเลย! 🚀'
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="text-center">
              <p className="text-xs text-neutral-text-secondary">
                การส่งข้อมูลแสดงว่าคุณยอมรับ
                <Link href="/terms" className="text-primary-green hover:underline ml-1">
                  ข้อตกลงการใช้งาน
                </Link>
                และ
                <Link href="/privacy" className="text-primary-green hover:underline ml-1">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-secondary-blue-light rounded-xl p-4 border border-secondary-blue">
          <div className="flex items-start">
            <div className="text-2xl mr-3">🔒</div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-blue mb-2">ข้อมูลของคุณปลอดภัย</h3>
              <ul className="text-sm text-neutral-text-secondary space-y-1">
                <li>• เข้ารหัสและป้องกันข้อมูลตามมาตรฐาน SSL</li>
                <li>• ไม่เก็บนำข้อมูลไปใช้เพื่อการอื่น</li>
                <li>• ลบข้อมูลหลังการขายเสร็จสิ้น</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}