# 🏗️ MediClear — System Architecture

> Kiến trúc tổng thể ứng dụng Trợ lý Y tế AI cho người cao tuổi

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | SPA mobile-first UI |
| **Styling** | Tailwind CSS 4 | Clinical Modern Wellness design system |
| **Animation** | Motion (Framer Motion) | Micro-interactions & transitions |
| **Icons** | Lucide React | Consistent icon system |
| **Backend** | Express.js + TSX | API server (dev hot-reload) |
| **AI Engine** | Google Gemini 2.5 Flash (Multimodal) | Prescription scanning, drug lookup, interaction check |
| **Search** | Google Search Grounding | Real-time drug information from web |
| **Auth** | Firebase Authentication (Google Sign-In) | User identity + OAuth token for Calendar |
| **Database** | Cloud Firestore | User profiles, scan history, medication records |
| **Calendar** | Google Calendar API (REST) | Automated medication reminders |
| **Build** | Vite + esbuild | Fast dev server & production bundling |

---

## Project Structure

```
MediClear/
├── docs/                          # Spec-Driven Development docs
│   ├── architecture.md            # This file
│   └── features/                  # Feature specs (1 folder per feature)
│       ├── ai-prescription-scan/
│       ├── drug-interaction/
│       ├── sos-emergency/
│       ├── cloud-sync/
│       ├── voice-input/
│       ├── onboarding/
│       └── pwa/
├── server/                        # Express backend (Clean Layered Architecture)
│   ├── config/
│   │   └── env.ts                 # Centralized type-safe environment config
│   ├── prompts/                   # Centralized AI prompt engineering
│   │   ├── meds.prompt.ts         # Drug lookup & Google Search Grounding prompt
│   │   ├── scan.prompt.ts         # Prescription / Lab Vision OCR prompt
│   │   └── index.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts        # Centralized global error handler
│   │   ├── requestLogger.ts       # Lightweight API request logger
│   │   └── vite.ts                # Vite dev middleware & static SPA handler
│   ├── controllers/
│   │   ├── meds.controller.ts     # Drug lookup controller
│   │   └── scan.controller.ts     # Prescription scan controller
│   ├── services/
│   │   ├── gemini.ts              # Gemini SDK singleton
│   │   ├── meds.service.ts        # Business logic: Drug lookup with search grounding
│   │   └── scan.service.ts        # Business logic: Gemini Vision Multimodal OCR
│   ├── routes/
│   │   ├── index.ts               # Master API router (/api/health, /api/meds, /api/scan)
│   │   ├── meds.ts                # POST /api/meds/search router
│   │   ├── scan.ts                # POST /api/scan/prescription router
│   │   └── interactions.ts        # POST /api/interactions/check [NEW]
│   ├── app.ts                     # Express App factory & middleware pipeline
│   └── index.ts                   # Clean server bootstrap & Graceful Shutdown
├── src/                           # React frontend
│   ├── App.tsx                    # Root component, state management, tab routing
│   ├── firebase.ts                # Firebase init (Auth + Firestore)
│   ├── types.ts                   # Shared TypeScript interfaces
│   ├── main.tsx                   # React DOM entry
│   ├── index.css                  # Global styles
│   └── components/
│       ├── Navbar.tsx             # Top header bar
│       ├── BottomNav.tsx          # Bottom tab navigation
│       ├── RecordsTab.tsx         # Tab 1: Scan đơn thuốc/xét nghiệm
│       ├── MedsTab.tsx            # Tab 2: Tra cứu thuốc AI
│       ├── HistoryTab.tsx         # Tab 3: Lịch sử khám & tra cứu
│       ├── ProfileTab.tsx         # Tab 4: Hồ sơ cá nhân & cài đặt
│       ├── LightboxModal.tsx      # Full-screen image viewer
│       ├── AlertDialogs.tsx       # Alert & confirmation modals
│       └── SOSButton.tsx          # Floating SOS emergency button [NEW]
├── GEMINI.md                      # Competition judging criteria
├── FEATURES.md                    # Master feature checklist
└── package.json
```

---

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  User chụp  │────▶│  Express API │────▶│  Gemini AI      │
│  ảnh đơn    │     │  /api/scan   │     │  Vision + Text  │
│  thuốc      │     └──────┬───────┘     └────────┬────────┘
└─────────────┘            │                      │
                           │◀─────────────────────┘
                           │  Structured JSON Result
                    ┌──────▼───────┐
                    │  React UI    │
                    │  Hiển thị    │──────▶ Google Calendar API
                    │  kết quả     │       (Tạo lịch nhắc thuốc)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Firestore   │
                    │  Lưu trữ     │
                    └──────────────┘
```

---

## API Endpoints

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| `POST` | `/api/scan` | ✅ Done | Scan ảnh đơn thuốc/xét nghiệm bằng Gemini 2.5 Flash Vision |
| `POST` | `/api/meds/search` | ✅ Done | Tra cứu thuốc bằng tên/ảnh + Search Grounding |
| `POST` | `/api/interactions/check` | 🔴 TODO | Kiểm tra tương tác thuốc |
| `GET`  | `/api/health` | ✅ Done | Health check |

---

## Firestore Collections

```
users/
  {uid}/
    profile/
      info          # UserProfile (nickname, age, conditions, SOS contact)
    records/
      {recordId}    # HistoryRecord (scan results, images)
    scans/
      {scanId}      # PrescriptionScanResult (AI analysis) [NEW]
```

---

## Design System: Clinical Modern Wellness

| Token | Color | Usage |
|-------|-------|-------|
| **Base** | `#FFFFFF`, `slate-50/100/200` | Backgrounds |
| **Primary** | `emerald-600/500/50` | Healing, positive actions |
| **Secondary** | `sky-600/500/50` | Trust, medical info |
| **Warning** | `amber-50/200/800` | Mild alerts |
| **Danger** | `rose-50/600/700` | Drug interactions, SOS |
| **Text** | `slate-800/900` | WCAG AAA contrast |
