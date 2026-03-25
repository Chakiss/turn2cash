'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/firebase';

export default function HomePage() {
  useEffect(() => {
    trackEvent('page_view', { page: 'home' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      {/* 🧱 1. Hero Section (Above the Fold) - เติมความหรูหราและมิติ */}
      <section className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-white to-white relative py-28 px-4 overflow-hidden border-b border-neutral-100">
        {/* Background Graphics - ปรับให้ดูเป็นงานดีไซน์มากขึ้น ไม่ใช่แค่รูปทรงพื้นฐาน */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute -top-10 left-1/4 w-72 h-72 bg-green-100/50 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -right-20 w-60 h-60 bg-blue-100/40 rounded-full blur-3xl"></div>
          {/* เพิ่มเส้น Grid บางๆ ให้ดูมีโครงสร้าง */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNhY2FjYWMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIwVjIwek0wIDIwaDIwdjIwSDBWMjB6TTIwIDBoMjB2MjBIMjBWMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        <div className="text-center text-neutral-900 max-w-5xl mx-auto relative z-10">
          {/* Badge - เติมจุดโฟกัสเล็กๆ */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-6 shadow-inner">
            <span className="relative flex h-2 w-2 mr-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            บริการรับซื้อถึงที่ จ่ายเงินสดทันที
          </div>

          {/* Main Headline - ปรับ Font Weight และ Spacing */}
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter text-neutral-950">
            ขายมือถือเก่า<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-500">ง่ายๆ ได้เงินจริง</span>
          </h1>
          
          {/* Subtext - ปรับขนาดและสีให้นุ่มนวลขึ้น */}
          <p className="text-xl md:text-2xl mb-12 text-neutral-600 font-normal max-w-2xl mx-auto leading-relaxed">
            เช็คราคาฟรี ไม่บังคับขาย<br />
            ทีมงานคุณภาพรับซื้อถึงหน้าบ้าน จ่ายสด ลดความยุ่งยาก
          </p>
          
          {/* CTA (Primary) - เพิ่ม Hover Interaction ที่ดูพรีเมียม */}
          <Link 
            href="/estimate"
            className="group inline-flex items-center gap-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xl py-5 px-14 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-green-100 hover:-translate-y-1 transition-all duration-300 mb-16"
            onClick={() => trackEvent('estimate_started', { source: 'hero_cta' })}
          >
            เริ่มเช็คราคาฟรี
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>
          
          {/* Supporting Trust - ปรับสไตล์ให้ดูสะอาดตาและเป็นระเบียบ */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-base max-w-3xl mx-auto border border-neutral-100 bg-white/50 backdrop-blur-sm py-5 px-8 rounded-full shadow-inner">
            {[
              {icon: "✨", text: "ไม่มีค่าใช้จ่ายแอบแฝง"},
              {icon: "📈", text: "ประเมินตามราคาตลาดจริง"},
              {icon: "🏠", text: "บริการรับถึงบ้านทั่วพื้นที่"},
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-neutral-700 font-medium">
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚡ 2. How It Works - ปรับ Card ให้ดูมี "Depth" (ความลึก) */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="max-w-3xl mb-16">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-green-600 mb-3">How it works</div>
          <h2 className="text-4xl font-extrabold tracking-tighter md:text-5xl text-neutral-950">ขายมือถือ ง่ายแค่ 4 ขั้นตอน</h2>
          <p className="mt-5 text-lg text-neutral-600 max-w-2xl leading-relaxed">ไม่ต้องเสียเวลาเดินหาร้านให้เหนื่อย เช็คราคาเบื้องต้นผ่านหน้าเว็บก่อนตัดสินใจได้เลย เราเน้นความโปร่งใสทุกขั้นตอน</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[
            ["1", "เลือกรุ่นมือถือ", "เลือกยี่ห้อ รุ่น และความจุของคุณ"],
            ["2", "เลือกสภาพเครื่อง", "ประเมินเบื้องต้นตามการใช้งานจริง"],
            ["3", "เห็นราคาทันที", "รู้ช่วงราคาคร่าว ๆ ก่อนคุยกับเรา"],
            ["4", "นัดรับและรับเงิน", "ยืนยันราคา นัดรับเครื่อง และจ่ายจริง"],
          ].map(([step, title, text]) => (
            <div key={step} className="group relative rounded-3xl border border-neutral-100 bg-white p-7 shadow-sm hover:shadow-xl hover:border-green-100 transition-all duration-300 hover:-translate-y-1">
              {/* กราฟิกเลขขั้นตอนแบบจางๆ */}
              <div className="absolute top-6 right-6 text-7xl font-black text-green-50 opacity-50 group-hover:opacity-100 transition-opacity">
                {step}
              </div>
              
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 font-bold text-xl text-white shadow-lg shadow-green-100 relative z-10">
                {step}
              </div>
              <div className="mt-8 text-xl font-bold text-neutral-950 relative z-10">{title}</div>
              <div className="mt-3 text-base leading-relaxed text-neutral-600 relative z-10">{text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 💰 3. Price Hook Section - ปรับ Gradient ให้ดู Soft และหรูขึ้น */}
      <section className="bg-neutral-950 py-20 px-4 relative overflow-hidden">
        {/* Abstract Background for Dark Section */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-8 leading-tight">
            มือถือคุณมีค่าแค่ไหน?
          </h2>
          
          <p className="text-xl md:text-2xl mb-12 font-light text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            เช็คราคาได้ <span className="font-semibold text-green-400">ทันที</span> ไม่ต้องรอคิว<br />ไม่ต้องกรอกข้อมูลส่วนตัวก่อนเห็นราคา
          </p>
          
          <Link 
            href="/estimate"
            className="inline-block bg-white text-neutral-950 font-bold text-2xl py-5 px-16 rounded-2xl shadow-2xl hover:bg-neutral-50 transform hover:scale-105 transition-all duration-300 hover:shadow-green-900/50"
            onClick={() => trackEvent('estimate_started', { source: 'price_hook' })}
          >
            เช็คราคาเลยตอนนี้
          </Link>
        </div>
      </section>

      {/* 🤝 4. Trust Section - เพิ่มสีสันเล็กน้อยและทำให้ดูน่าเชื่อถือ */}
      <section className="bg-neutral-50 py-24 md:py-32 border-t border-neutral-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 md:px-8">
          {[
            ["⚡", "ไม่มีค่าใช้จ่าย", "เช็คราคาได้ฟรี 100% ไม่บังคับขาย ไม่ต้องเกรงใจ"],
            ["📅", "นัดรับสะดวก", "คุยเวลาที่สะดวกได้ตามพื้นที่ให้บริการ เราพร้อมปรับตามคุณ"],
            ["🤝", "คุยกับคนจริง", "ช่วงเริ่มต้นทีมงานดูแลเองทุกเคส ให้คำปรึกษาตรงไปตรงมา"],
          ].map(([icon, title, text]) => (
            <div key={title} className="flex gap-5 rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm transition-hover hover:shadow-md">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-3xl shadow-inner border border-green-100">
                {icon}
              </div>
              <div>
                <div className="text-xl font-bold text-neutral-950">{title}</div>
                <div className="mt-2 text-base leading-relaxed text-neutral-600">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ 5. Social Proof - ปรับ Card ให้ดูเหมือน "ใบเสร็จ" หรือ "บันทึก" เล็กน้อย */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="max-w-3xl mb-16">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-green-600 mb-3">Reviews</div>
          <h2 className="text-4xl font-extrabold tracking-tighter md:text-5xl text-neutral-950">ลูกค้าพูดถึงเรา</h2>
          <p className="mt-5 text-lg text-neutral-600 max-w-2xl leading-relaxed">รีวิวจริงจากความประทับใจของลูกค้าที่ใช้บริการ Turn2Cash เปลี่ยนมือถือเป็นเงินสด</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {stars: 5, quote: "ขายง่าย ได้เงินจริง ไม่ต้องไปหน้าร้านเองเลย ประทับใจมากครับ", name: "คุณสมชาย", loc: "กรุงเทพฯ"},
            {stars: 5, quote: "เช็คราคาไวมาก นัดรับวันเดียวจบ จ่ายเงินสดหน้างานจริงตามที่ตกลง", name: "คุณแน็น", loc: "เชียงใหม่"},
          ].map((rev, idx) => (
            <div key={idx} className="rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm flex flex-col hover:border-green-100 transition-colors">
              <div className="flex mb-6 text-xl">
                {[...Array(rev.stars)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
              </div>
              <p className="text-xl font-medium mb-6 text-neutral-800 leading-relaxed grow">
                "{rev.quote}"
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-neutral-100">
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 border border-neutral-200">
                  {rev.name[3]}
                </div>
                <div>
                  <p className="text-base font-semibold text-neutral-950">{rev.name}</p>
                  <p className="text-sm text-neutral-500">{rev.loc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📱 6. Device Supported - ปรับ Grid ให้สวยงามและมีมิติ */}
      <section className="bg-white py-24 px-4 border-y border-neutral-100 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-center mb-16 text-neutral-950">
            รองรับมือถือและอุปกรณ์ยอดนิยม
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {icon: "🍎", title: "iPhone", text: "iPhone 6 - iPhone 15"},
              {icon: "📱", title: "Samsung", text: "Galaxy S, Note, A Series"},
              {icon: "💻", title: "iPad / Tablet", text: "iPad Pro, Air, Samsung Tab"},
              {icon: "📳", title: "ยี่ห้ออื่น ๆ", text: "Huawei, Oppo, Vivo, Xiaomi"},
            ].map((dev, idx) => (
              <div key={idx} className="text-center bg-white border border-neutral-100 p-8 rounded-3xl shadow-inner hover:shadow-md transition-shadow">
                <div className="text-7xl mb-6">{dev.icon}</div>
                <h3 className="text-2xl font-bold mb-2 text-neutral-950">{dev.title}</h3>
                <p className="text-base text-neutral-600 leading-relaxed">{dev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔥 7. Final CTA Section - ปรับให้ดูเป็น Highlight ของหน้าเว็บ */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <div className="rounded-[40px] bg-neutral-950 px-8 py-16 text-white md:px-16 md:py-20 relative overflow-hidden shadow-2xl shadow-green-950/20">
          {/* กราฟิกพื้นหลังสำหรับ CTA */}
          <div className="absolute inset-0 opacity-20">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid md:grid-cols-5 gap-12 items-center relative z-10">
            <div className="md:col-span-3">
              <div className="text-sm font-bold uppercase tracking-[0.25em] text-green-400 mb-3">พร้อมเริ่มไหม</div>
              <h3 className="text-4xl font-extrabold tracking-tighter md:text-6xl text-white leading-tight">อย่าปล่อย<br/>มือถือเก่าทิ้งไว้เฉย ๆ</h3>
              <p className="mt-6 text-xl text-neutral-200 max-w-xl leading-relaxed">
                ลองเช็คราคาก่อนวันนี้ ถ้าพอใจในราคาและเงื่อนไขค่อยส่งข้อมูลให้ทีมงานติดต่อกลับไปนัดรับ
              </p>
            </div>
            
            <div className="md:col-span-2 text-center md:text-right">
              <Link
                href="/estimate"
                className="group inline-flex items-center gap-3 bg-white text-neutral-950 font-bold text-2xl py-6 px-14 rounded-full transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-white/20"
                onClick={() => trackEvent('estimate_started', { source: 'final_cta' })}
              >
                เช็คราคาเลยตอนนี้
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📌 8. Footer - ปรับให้ดูสะอาดตาและเป็นระเบียบตามมาตรฐานเว็บสมัยใหม่ */}
      <footer className="bg-neutral-50 text-neutral-800 py-20 px-4 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h3 className="text-3xl font-black mb-4 text-green-600 tracking-tighter">Turn2Cash</h3>
              <p className="text-base text-neutral-600 max-w-xs leading-relaxed">เปลี่ยนมือถือเก่าให้เป็นเงินสด ง่าย รวดเร็ว และเป็นธรรมสำหรับคุณ</p>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-10">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-neutral-950">เกี่ยวกับเรา</h4>
                <ul className="space-y-3.5 text-base text-neutral-700">
                  {["เกี่ยวกับบริษัท", "ข่าวสาร", "คำถามที่พบบ่อย", "สมัครงาน"].map(link => (
                      <li key={link}><a href="#" className="hover:text-green-600 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-neutral-950">ติดต่อเรา</h4>
                <ul className="space-y-3.5 text-base text-neutral-700">
                  <li className="flex items-center gap-2.5">📞 <span>02-123-4567</span></li>
                  <li className="flex items-center gap-2.5">📱 <a href="#" className="hover:text-green-600 transition-colors">Line: @turn2cash</a></li>
                  <li className="flex items-center gap-2.5">✉️ <a href="mailto:info@turn2cash.com" className="hover:text-green-600 transition-colors">info@turn2cash.com</a></li>
                </ul>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-neutral-950">นโยบาย</h4>
                <ul className="space-y-3.5 text-base text-neutral-700">
                  {["ความเป็นส่วนตัว", "เงื่อนไขการใช้บริการ", "การประเมินราคา"].map(link => (
                      <li key={link}><a href="#" className="hover:text-green-600 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-100 mt-16 pt-10 text-center text-sm text-neutral-500">
            <p>&copy; 2026 Turn2Cash Co., Ltd. สงวนลิขสิทธิ์ทุกประการ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
