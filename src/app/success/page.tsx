'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/firebase';

export default function SuccessPage() {
  const [leadId, setLeadId] = useState<string | null>(null);

  useEffect(() => {
    // Get lead ID from localStorage
    const storedLeadId = localStorage.getItem('leadId');
    if (storedLeadId) {
      setLeadId(storedLeadId);
      trackEvent('form_submitted', { lead_id: storedLeadId });
    }

    // Clear localStorage after successful submission
    localStorage.removeItem('selectedDevice');
    localStorage.removeItem('priceEstimate');
    localStorage.removeItem('leadId');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green via-secondary-blue to-accent-gold">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="text-6xl md:text-8xl mb-6 animate-bounce">
            ✅
          </div>
          
          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-text-primary mb-4">
            ส่งข้อมูลเรียบร้อยแล้ว!
          </h1>
          
          <p className="text-xl text-neutral-text-secondary mb-8">
            <span className="text-primary-green font-semibold">เราจะติดต่อคุณภายใน 1 ชั่วโมง</span>
          </p>
          
          {/* Lead ID */}
          {leadId && (
            <div className="bg-neutral-bg-light rounded-lg p-4 mb-8">
              <p className="text-sm text-neutral-text-secondary mb-1">รหัสการขาย</p>
              <p className="font-mono text-lg font-semibold text-neutral-text-primary">
                {leadId}
              </p>
            </div>
          )}
          
          {/* Next Steps */}
          <div className="text-left bg-primary-green-light rounded-xl p-6 mb-8 border border-primary-green">
            <h2 className="text-lg font-semibold text-primary-green mb-4 text-center">
              ขั้นตอนต่อไป
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary-green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-text-primary">เราจะโทรหาคุณ</h3>
                  <p className="text-sm text-neutral-text-secondary">
                    ภายใน 1 ชั่วโมง เพื่อยืนยันรายละเอียดและนัดหมายรับซื้อ
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-text-primary">ตรวจสอบมือถือ</h3>
                  <p className="text-sm text-neutral-text-secondary">
                    ช่างของเราจะไปตรวจสอบสภาพจริงถึงที่
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-text-primary">รับเงินทันที</h3>
                  <p className="text-sm text-neutral-text-secondary">
                    หากสภาพตรงตามที่ประเมิน จ่ายเงินทันที
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="bg-secondary-blue-light rounded-xl p-6 mb-8 border border-secondary-blue">
            <h3 className="font-semibold text-secondary-blue mb-3">
              📞 ต้องการติดต่อเรา?
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-text-secondary">
                📱 โทร: <span className="font-semibold text-neutral-text-primary">02-XXX-XXXX</span>
              </p>
              <p className="text-neutral-text-secondary">
                💬 LINE: <span className="font-semibold text-neutral-text-primary">@turn2cash</span>
              </p>
              <p className="text-neutral-text-secondary">
                ⏰ เวลาทำการ: จันทร์-อาทิตย์ 9:00-20:00
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="block btn-primary text-lg py-3"
            >
              กลับหน้าหลัก
            </Link>
            
            <Link 
              href="/estimate"
              className="block btn-outline text-lg py-3"
              onClick={() => trackEvent('estimate_started', { source: 'success_page' })}
            >
              ขายมือถืออีกเครื่อง
            </Link>
          </div>
          
          {/* Tips */}
          <div className="mt-8 p-4 bg-accent-gold-light rounded-lg border border-accent-gold">
            <h3 className="font-semibold text-accent-gold mb-2">
              💡 เคล็ดลับขณะรอ
            </h3>
            <ul className="text-sm text-neutral-text-secondary text-left space-y-1">
              <li>• ทำความสะอาดเครื่องให้เรียบร้อย</li>
              <li>• เตรียมกล่องและอุปกรณ์ (ถ้ามี)</li>
              <li>• สำรองข้อมูลสำคัญ</li>
              <li>• ลบข้อมูลส่วนตัวออกหมด</li>
            </ul>
          </div>
          
          {/* Social Proof */}
          <div className="mt-8 p-4 bg-neutral-bg-light rounded-lg">
            <p className="text-sm text-neutral-text-secondary mb-2">
              ⭐️⭐️⭐️⭐️⭐️
            </p>
            <p className="text-sm text-neutral-text-secondary italic">
              "ขายมือถือง่ายมาก ได้ราคาดี ทีมงานสุภาพ แนะนำเลยค่ะ"
            </p>
            <p className="text-xs text-neutral-text-secondary mt-1">
              - คุณ A. ลูกค้าประจำ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}