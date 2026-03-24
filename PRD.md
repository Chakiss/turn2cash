# Turn2Cash MVP - Product Requirements Document (PRD)

---

## 1. Product Overview

### Product Name

**Turn2Cash**

### Objective

Enable users to:

* Instantly estimate the value of their used devices
* Submit a request to sell their device
* Allow internal team to process leads manually

---

## 2. Goals & Success Metrics

### Business Goals

* Generate high-quality leads
* Validate market demand

### Success Metrics

| Metric                              | Target |
| ----------------------------------- | ------ |
| Conversion Rate (Estimate → Submit) | ≥ 15%  |
| Leads per Day                       | ≥ 20   |
| Close Rate                          | ≥ 30%  |
| Average Margin                      | ≥ 15%  |

---

## 3. User Personas

### 3.1 Seller (Primary)

* Age: 20–45
* Owns used smartphone
* Wants fast cash

**Pain Points:**

* Unclear pricing
* Fear of scams
* Inconvenience of visiting stores

### 3.2 Admin / Operator

* Internal team
* Manages leads and completes transactions

---

## 4. MVP Scope

### In Scope

1. Price Estimation
2. Lead Submission Form
3. Admin Dashboard
4. Static Pricing Engine

### Out of Scope (Phase 2)

* Payment integration
* Automated logistics
* AI pricing
* Marketplace

---

## 5. User Flow

### Seller Flow

Home → Select Device → Select Condition → Show Price → Submit Form → Success

### Admin Flow

Login → View Leads → Update Status → Contact Customer

---

## 6. Functional Requirements

### 6.1 Price Estimation

**Input:**

* brand
* model
* storage
* condition (good / fair / bad)

**Output:**

* price range (min / max)

**Example Pricing JSON:**

```json
{
  "iPhone11": {
    "64GB": {
      "good": [4800, 5200],
      "fair": [4200, 4700],
      "bad": [3500, 4000]
    }
  }
}
```

---

### 6.2 Lead Submission API

**Endpoint:**
POST /api/lead

**Payload:**

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

---

### 6.3 Admin Dashboard

**Features:**

* View leads list
* Filter by status/date
* Update status

**Statuses:**

* NEW
* CONTACTED
* PICKUP
* COMPLETED
* REJECTED

---

## 7. Data Model (Firestore)

```json
{
  "id": "uuid",
  "name": "string",
  "phone": "string",
  "line_id": "string",
  "address": "string",
  "device": {
    "brand": "",
    "model": "",
    "storage": "",
    "condition": ""
  },
  "price_min": 4800,
  "price_max": 5200,
  "images": [],
  "status": "NEW",
  "created_at": "timestamp"
}
```

---

## 8. UI Requirements

### Home Page

* Headline: "เปลี่ยนมือถือเก่าเป็นเงินใน 1 นาที"
* CTA: "เช็คราคา"

### Estimate Page

* Step-based selection
* Progress indicator

### Result Page

* Highlight price range
* CTA: "ขายเลย"

### Form Page

* Mobile-first
* Autofill device info

### Success Page

* Confirmation message
* "เราจะติดต่อคุณภายใน 1 ชั่วโมง"

---

## 9. Non-Functional Requirements

| Area         | Requirement      |
| ------------ | ---------------- |
| Performance  | < 2 seconds load |
| Mobile       | Fully responsive |
| Security     | Basic validation |
| Availability | 99% uptime       |

---

## 10. Validation Rules

* name: required
* phone: required
* device: required
* condition: required

---

## 11. Analytics

Track events:

* page_view
* estimate_started
* estimate_completed
* form_submitted

Tools:

* Firebase Analytics / GA4

---

## 12. Deployment

* Hosting: Firebase Hosting
* Domain: turn2cash.app
* SSL: Auto-enabled

---

## 13. Tech Architecture

Frontend (Next.js)
→ API Routes
→ Firestore DB
→ Firebase Storage

---

## 14. Testing

Manual Test Cases:

* Price estimation works correctly
* Form submission successful
* Admin can update status

---

## 15. Timeline

| Week | Task                |
| ---- | ------------------- |
| 1    | UI + Estimate Logic |
| 2    | Form + API          |
| 3    | Admin Dashboard     |
| 4    | Launch + Ads        |

---

## Final Notes

* Focus on speed to launch
* Validate demand early
* Avoid over-engineering

---

**End of Document**
