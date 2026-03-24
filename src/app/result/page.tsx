'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPriceEstimate, formatPriceRange } from '@/lib/pricing';
import { trackEvent } from '@/lib/firebase';
import type { Device, PriceRange } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get device data from localStorage
    const savedDevice = localStorage.getItem('selectedDevice');
    if (savedDevice) {
      try {
        const deviceData = JSON.parse(savedDevice) as Device;
        setDevice(deviceData);
        
        // Get price estimate
        const estimate = getPriceEstimate(deviceData);
        if (estimate) {
          setPriceRange(estimate);
          trackEvent('estimate_completed', {
            brand: deviceData.brand,
            model: deviceData.model,
            storage: deviceData.storage,
            condition: deviceData.condition,
            price_min: estimate.min,
            price_max: estimate.max
          });
        } else {
          // Redirect back to estimate if no price found
          router.push('/estimate');
        }
      } catch (error) {
        router.push('/estimate');
      }
    } else {
      router.push('/estimate');
    }
    setLoading(false);
  }, [router]);

  const handleSell = () => {
    if (device && priceRange) {
      // Store price estimate for the form page
      localStorage.setItem('priceEstimate', JSON.stringify([priceRange.min, priceRange.max]));
      trackEvent('form_started', {
        brand: device.brand,
        model: device.model,
        price_range: `${priceRange.min}-${priceRange.max}`
      });
      router.push('/form');
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

  const getConditionColor = (condition: string) => {
    const colorMap = {
      good: 'text-primary-green',
      fair: 'text-accent-gold',
      bad: 'text-accent-orange'
    };
    return colorMap[condition as keyof typeof colorMap] || 'text-neutral-text-primary';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-neutral-text-secondary">กำลังคำนวณราคา...</p>
        </div>
      </div>
    );
  }

  if (!device || !priceRange) {
    return (
      <div className="min-h-screen bg-neutral-bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-text-secondary mb-4">ไม่พบข้อมูลการประเมิน</p>
          <Link href="/estimate" className="btn-primary">
            ประเมินราคาใหม่
          </Link>
        </div>
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
            <Link href="/estimate" className="btn-ghost">
              ← ประเมินใหม่
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-text-primary mb-2">
            ประเมินราคาเสร็จแล้ว!
          </h1>
          <p className="text-lg text-neutral-text-secondary">
            นี่คือราคาที่เราสามารถรับซื้อได้
          </p>
        </div>

        {/* Device Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-text-primary mb-1">
                {device.brand} {device.model}
              </h2>
              <p className="text-neutral-text-secondary">
                {device.storage} • <span className={getConditionColor(device.condition)}>{getConditionText(device.condition)}</span>
              </p>
            </div>
            <div className="text-4xl">📱</div>
          </div>

          {/* Price Display */}
          <div className="text-center py-8 px-4 bg-gradient-to-r from-primary-green-light to-accent-gold-light rounded-xl border border-primary-green">
            <div className="text-sm font-semibold text-neutral-text-secondary mb-2 uppercase tracking-wide">
              ราคารับซื้อ
            </div>
            <div className="price-highlight mb-4">
              {formatPriceRange(priceRange)}
            </div>
            <p className="text-neutral-text-secondary">
              ราคาอาจปรับขึ้น-ลงตามสภาพจริง
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button
              onClick={handleSell}
              className="btn-primary flex-1 text-xl py-4 font-bold"
            >
              ขายเลย! 🚀
            </button>
            <Link 
              href="/estimate" 
              className="btn-outline flex-1 text-center py-4"
            >
              ประเมินอีกเครื่อง
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-secondary-blue-light rounded-xl border border-secondary-blue">
            <div className="flex items-start">
              <div className="text-2xl mr-3">💡</div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-blue mb-2">เคล็ดลับได้ราคาดี</h3>
                <ul className="text-sm text-neutral-text-secondary space-y-1">
                  <li>• เครื่องสะอาด ไม่มีรอยเท้า</li>
                  <li>• มีกล่อง อุปกรณ์ครบ</li>
                  <li>• ลบข้อมูลส่วนตัวออกหมด</li>
                  <li>• แบตเตอรี่เสื่อมต่ำกว่า 80%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h3 className="text-xl font-semibold mb-6 text-center">ทำไมต้องขายกับเรา?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-green-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2">รวดเร็ว</h4>
              <p className="text-sm text-neutral-text-secondary">
                ติดต่อภายใน 1 ชั่วโมง<br />รับซื้อถึงที่
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent-gold-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-semibold mb-2">ราคาดี</h4>
              <p className="text-sm text-neutral-text-secondary">
                ราคาตามมูลค่าตลาด<br />ไม่มีค่าซ่อม
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary-blue-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="font-semibold mb-2">ปลอดภัย</h4>
              <p className="text-sm text-neutral-text-secondary">
                ลบข้อมูลสะอาด<br />โอนเงินทันที
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-primary-green to-secondary-blue py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            พร้อมขายแล้วใช่ไหม?
          </h3>
          <p className="text-white/90 mb-6">
            กรอกข้อมูลติดต่อ เราจะรับซื้อถึงที่ภายใน 24 ชั่วโมง
          </p>
          <button
            onClick={handleSell}
            className="bg-accent-orange hover:bg-accent-orange/90 text-white font-bold text-xl py-4 px-12 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            ขายเลย! ได้เงินจริง
          </button>
        </div>
      </div>
    </div>
  );
}