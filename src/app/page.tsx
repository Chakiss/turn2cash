'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/firebase';

export default function HomePage() {
  useEffect(() => {
    trackEvent('page_view', { page: 'home' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green via-secondary-blue to-accent-gold">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow animate-fade-in">
            เปลี่ยนมือถือเก่า<br />
            <span className="text-accent-gold">เป็นเงินใน 1 นาที</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in" style={{animationDelay: '0.3s'}}>
            ประเมินราคาฟรี • รับซื้อถึงที่ • ได้เงินจริง
          </p>
          
          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">เร็วที่สุด</h3>
              <p className="text-sm text-white/80">ประเมินราคาใน 30 วินาที</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-semibold mb-2">ปลอดภัย</h3>
              <p className="text-sm text-white/80">ไม่มีค่าซ่อน โปร่งใส</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">ราคาดี</h3>
              <p className="text-sm text-white/80">ได้เงินสูงสุดในตลาด</p>
            </div>
          </div>
          
          {/* CTA Button */}
          <Link 
            href="/estimate"
            className="inline-block bg-accent-orange hover:bg-accent-orange/90 text-white font-bold text-xl py-4 px-12 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-slide-up"
            style={{animationDelay: '0.9s'}}
            onClick={() => trackEvent('estimate_started', { source: 'home_cta' })}
          >
            เช็คราคาเลย!
          </Link>
          
          <p className="text-sm text-white/70 mt-4 animate-fade-in" style={{animationDelay: '1.2s'}}>
            ใช้เวลาแค่ 1 นาที • ฟรี 100%
          </p>
        </div>
        
        {/* Floating Phone Illustration */}
        <div className="absolute top-20 right-10 hidden lg:block animate-bounce">
          <div className="text-6xl opacity-20">📱</div>
        </div>
        
        <div className="absolute bottom-20 left-10 hidden lg:block animate-bounce" style={{animationDelay: '1s'}}>
          <div className="text-5xl opacity-20">💎</div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-text-primary">
            ทำไมต้อง <span className="text-primary-green">Turn2Cash</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-green-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">ราคายุติธรรม</h3>
              <p className="text-neutral-text-secondary">ประเมินด้วยข้อมูลตลาดจริง</p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary-blue-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">รับซื้อถึงที่</h3>
              <p className="text-neutral-text-secondary">ไม่ต้องเดินทาง สะดวกสบาย</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent-gold-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">จ่ายเงินเร็ว</h3>
              <p className="text-neutral-text-secondary">โอนเงินทันทีหลังตรวจสอบ</p>
            </div>
            
            <div className="text-center">
              <div className="bg-accent-orange-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">ปลอดภัย</h3>
              <p className="text-neutral-text-secondary">ลบข้อมูลส่วนตัวสะอาด</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-neutral-bg-light py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-neutral-text-primary">
            วิธีการขาย<span className="text-accent-gold">ง่ายๆ 4 ขั้นตอน</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'เลือกมือถือ', desc: 'เลือกยี่ห้อ รุ่น และสภาพ', icon: '📱' },
              { step: '2', title: 'ดูราคา', desc: 'รับราคาประเมินทันที', icon: '💰' },
              { step: '3', title: 'ส่งข้อมูล', desc: 'กรอกข้อมูลติดต่อ', icon: '📝' },
              { step: '4', title: 'ได้เงิน', desc: 'รับเงินภายใน 1 ชั่วโมง', icon: '✅' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="bg-primary-green text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-neutral-text-primary">{item.title}</h3>
                <p className="text-neutral-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/estimate"
              className="btn-primary text-lg"
              onClick={() => trackEvent('estimate_started', { source: 'how_it_works' })}
            >
              เริ่มขายเลย!
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-neutral-text-primary text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 gradient-text">Turn2Cash</h3>
          <p className="text-neutral-text-secondary mb-4">
            เปลี่ยนมือถือเก่าเป็นเงิน ง่าย เร็ว ปลอดภัย
          </p>
          <p className="text-sm text-neutral-text-secondary">
            © 2026 Turn2Cash. สงวนลิขสิทธิ์ทุกประการ
          </p>
        </div>
      </footer>
    </div>
  );
}