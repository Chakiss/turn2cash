import { DM_Sans } from 'next/font/google';
import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Turn2Cash - เปลี่ยนมือถือเก่าเป็นเงินใน 1 นาที',
  description: 'ขายมือถือเก่าได้เงินจริง ประเมินราคาฟรี รับซื้อถึงที่ ปลอดภัย เชื่อถือได้',
  keywords: 'ขายมือถือเก่า, ประเมินราคามือถือ, รับซื้อมือถือ, iPhone, Samsung, Thai',
  openGraph: {
    title: 'Turn2Cash - เปลี่ยนมือถือเก่าเป็นเงิน',
    description: 'ขายมือถือเก่าได้เงินจริง ประเมินราคาฟรี รับซื้อถึงที่',
    type: 'website',
    locale: 'th_TH',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${dmSans.className} bg-neutral-bg-light min-h-screen`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}