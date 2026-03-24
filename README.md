# Turn2Cash MVP 📱💰

A Next.js application for instantly estimating and selling used mobile devices in Thailand.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up Firebase**
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Firebase Hosting 
   - Enable Firebase Analytics (optional)
   
3. **Configure environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase config
```

4. **Initialize Firebase (optional for deployment)**
```bash
npm install -g firebase-tools
firebase login
firebase init
```

5. **Run development server**
```bash
npm run dev
```

Visit http://localhost:3000

## 📱 Features

### User Flow
- **Home Page**: Thai headline with instant estimation CTA
- **Estimate Page**: Step-by-step device selection (brand → model → storage → condition) 
- **Result Page**: Price range display with sell CTA
- **Form Page**: Contact information collection
- **Success Page**: Confirmation with next steps

### Admin Dashboard 
- View all leads with filtering by status
- Update lead status (NEW → CONTACTED → PICKUP → COMPLETED → REJECTED)
- Lead statistics and conversion tracking
- Access at `/admin`

### Technical Features
- **Mobile-First Design**: Optimized for Thai mobile users
- **Thai Language Support**: Full Thai interface
- **Firebase Integration**: Firestore DB + Analytics
- **Static Pricing Engine**: Pre-configured Thai market prices
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern responsive design

## 🎨 Design System

### Colors
- **Primary Green**: `#00C853` (Trust & Money)
- **Secondary Blue**: `#1976D2` (Reliability) 
- **Accent Orange**: `#FF6F00` (Action/Urgency)
- **Gold**: `#FFB300` (Value/Premium)

### Typography
- **Thai Font**: Sarabun (Google Fonts)
- **Mobile-Optimized**: Larger touch targets
- **Progressive Enhancement**: Graceful degradation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Analytics**: Firebase Analytics
- **Hosting**: Firebase Hosting
- **Language**: TypeScript

## 📊 Analytics Events

Tracked events:
- `page_view` - Page visits
- `estimate_started` - User starts estimation
- `estimate_completed` - User completes device selection
- `form_submitted` - Lead form submitted
- `admin_login` - Admin dashboard access
- `lead_updated` - Admin updates lead status

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
npm run deploy
```

### Custom Domain
Configure in Firebase Hosting console:
- Domain: `turn2cash.app` 
- SSL: Auto-enabled

## 📝 API Endpoints

### `POST /api/lead`
Create new lead submission.

**Request:**
```json
{
  "name": "string",
  "phone": "string", 
  "line_id": "string",
  "address": "string",
  "device": {
    "brand": "Apple",
    "model": "iPhone11", 
    "storage": "64GB",
    "condition": "good"
  },
  "price_estimate": [4800, 5200],
  "images": []
}
```

**Response:**
```json
{
  "status": "success",
  "lead_id": "uuid"
}
```

## 💾 Data Model

### Lead Document (Firestore)
```typescript
interface Lead {
  id: string;
  name: string;
  phone: string;
  line_id: string;
  address: string;
  device: {
    brand: string;
    model: string; 
    storage: string;
    condition: 'good' | 'fair' | 'bad';
  };
  price_min: number;
  price_max: number;
  images: string[];
  status: 'NEW' | 'CONTACTED' | 'PICKUP' | 'COMPLETED' | 'REJECTED';
  created_at: Date;
}
```

## 📈 Success Metrics (from PRD)

| Metric | Target |
|--------|--------|
| Conversion Rate (Estimate → Submit) | ≥ 15% |
| Leads per Day | ≥ 20 |
| Close Rate | ≥ 30% |
| Average Margin | ≥ 15% |

## 🔒 Security

- **Input Validation**: Server-side validation for all forms
- **Firebase Rules**: Restricted database access
- **Rate Limiting**: Consider implementing for production
- **Data Privacy**: User data encryption and deletion policies

## 🗂️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Home page
│   ├── estimate/       # Device selection flow
│   ├── result/         # Price display
│   ├── form/          # Contact form
│   ├── success/       # Confirmation
│   ├── admin/         # Admin dashboard
│   └── api/           # API routes
├── components/         # Reusable UI components
├── lib/               # Utilities and services
│   ├── firebase.ts    # Firebase config
│   ├── pricing.ts     # Pricing engine
│   └── leadService.ts # Firestore operations
├── types/             # TypeScript definitions
└── styles/           # Global CSS
```

## 🔧 Environment Variables

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID= 
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Admin
ADMIN_PASSWORD=admin123
```

## 📱 Supported Devices

Current pricing data includes:
- **iPhone**: 11, 12, 13, 14, 15 series
- **Samsung Galaxy**: S21, S22, S23 series  
- **Google Pixel**: 7, 8 series

Storage options: 64GB, 128GB, 256GB, 512GB
Conditions: Good, Fair, Bad

## 🎯 MVP Focus

This is an MVP focused on:
- **Speed to launch** - Simple but functional
- **Lead generation** - High-quality leads for manual processing
- **Market validation** - Proving demand before scaling

**Out of Scope:**
- Payment integration
- Automated logistics  
- AI pricing
- Marketplace features

## 📞 Support

For technical issues or feature requests, contact the development team.

## 📄 License

MIT License - Turn2Cash Team 2026