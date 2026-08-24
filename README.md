# 🛠️ TradeSlot — Frontend Application

> **TradeSlot** is a modern, high-performance web platform for tradespeople to manage daily work zones, receive bookings through multiple intake channels (WhatsApp, Web Chatbot), schedule jobs with automated travel-time buffers, and collect payments via Stripe Connect.

---

## ⚡ Quick Overview

At a glance, the TradeSlot Frontend provides a **role-aware, glassmorphic web portal** tailored for 4 distinct user groups:

```
                          ┌──────────────────────────┐
                          │   TradeSlot Web App      │
                          └────────────┬─────────────┘
                                       │
        ┌──────────────────┬───────────┴───────────┬──────────────────┐
        ▼                  ▼                       ▼                  ▼
┌───────────────┐  ┌───────────────┐       ┌───────────────┐  ┌───────────────┐
│ 👷 Trader     │  │ 👤 Customer   │       │ 🏢 Business   │  │ 🛡️ Admin      │
│ Dashboard     │  │ Portal        │       │ Roster Admin  │  │ Platform Hub  │
└───────────────┘  └───────────────┘       └───────────────┘  └───────────────┘
```

- **👷 Traders**: Set daily work zones, review incoming channel bookings, view scheduled jobs with 30-min travel buffers, and connect Stripe accounts.
- **👤 Customers**: Browse slots, place booking requests, and manage personal bookings.
- **🏢 Business Admins**: Manage team rosters, technicians, and payout reports.
- **🛡️ Platform Admins**: System-wide user management, role assignments, and account status controls.

---

## ✨ Key Features

- **🎨 Modern Glassmorphic UI**: Designed with sleek OKLCH color palettes, smooth hover animations, custom loaders (`nextjs-toploader`), and dark mode support.
- **⏱️ 30-Minute Travel Buffer Visualizer**: Displays job schedules with dynamic travel-time buffer protection between bookings.
- **💬 Unified Channel Booking Simulator**: Simulates multi-channel booking intakes (WhatsApp & Web Chatbot) in real time.
- **💳 Stripe Connect Onboarding**: Direct onboarding flow for traders with return status handlers (`/stripe/return`).
- **📱 Responsive Mobile Drawer**: Navigation drawer for mobile devices.
- **🔐 Secure Better Auth & OTP Flow**: Email verification OTP modal, authentication route protection, and persistent user sessions.

---

## 🛠️ Tech Stack & Key Libraries

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) + Vanilla CSS design tokens (`globals.css`) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query v5](https://tanstack.com/query) |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons & UI Primitives** | [Lucide React](https://lucide.dev/), [Shadcn UI](https://ui.shadcn.com/), [Base UI](https://base-ui.com/) |
| **Notifications & Loaders** | [Sonner](https://sonner.emilkowal.ski/), `nextjs-toploader` |
| **Auth Client** | Better Auth Client SDK |

---

## 📁 Directory Structure

```
tradeslot-frontend/
├── src/
│   ├── app/
│   │   ├── (main-layout)/       # Public pages (Home, Login, Register, Verify, Stripe)
│   │   ├── (dashboard-layout)/  # Protected dashboard routes
│   │   │   ├── (admin)/         # Admin user & system management
│   │   │   ├── (business)/      # Business admin & team roster
│   │   │   ├── (customer)/      # Customer dashboard & booking list
│   │   │   └── (trader)/        # Trader dashboard & slot manager
│   │   ├── actions/             # Next.js Server Actions
│   │   ├── api/                 # API route handlers & proxy
│   │   ├── globals.css          # Design system, glassmorphic tokens & OKLCH theme
│   │   ├── loading.tsx          # Custom glassmorphic page load transition
│   │   └── not-found.tsx        # Branded 404 error page
│   ├── components/
│   │   ├── dashboard/           # Dashboard shell, header, sidebar components
│   │   ├── forms/               # Auth, booking, and work area forms
│   │   ├── layout/              # Public header, footer & mobile navigation
│   │   ├── modules/             # Booking visualizer, channel simulators
│   │   ├── shared/              # Reusable modal, loaders & status badges
│   │   └── ui/                  # UI components (Button, Input, Card, Dialog)
│   ├── config/                  # App routes configuration & RBAC rules
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Axios instance, Better Auth client & helpers
│   ├── services/                # API client service functions
│   └── store/                   # Zustand global state stores
├── public/                      # Static assets & favicon
└── vercel.json                  # Deployment configuration
```

---

## ⚙️ Quick Start Guide

### Prerequisites
- **Node.js**: `v20+`
- **Package Manager**: `pnpm` (recommended)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables Setup
Create a `.env.local` or `.env` file in the `tradeslot-frontend/` root directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_BACKEND_BASE_URL="http://localhost:5000"
BETTER_AUTH_URL="http://localhost:5000"
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for REST API endpoints (`/api/v1`) | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_BACKEND_BASE_URL` | Root URL of the Express backend | `http://localhost:5000` |
| `BETTER_AUTH_URL` | Auth server origin URL | `http://localhost:5000` |

---

## 🌐 Routes Overview

| Route | Access Role | Description |
| :--- | :--- | :--- |
| `/` | Public | High-impact Landing Page with booking simulator & feature breakdown |
| `/login` | Public | Account login with OTP option |
| `/register` | Public | Multi-role user registration |
| `/verify` | Public | Email OTP verification |
| `/dashboard` | Authenticated | Dynamic dashboard router based on user role |
| `/trader/work-area` | TRADER | Set daily work zone & operational radius |
| `/customer/dashboard` | CUSTOMER | Customer booking management portal |
| `/business/roster` | BUSINESS_ADMIN | Team roster management & technician control |
| `/admin/users` | PLATFORM_ADMIN | User management, role switching & suspensions |
| `/stripe/return` | TRADER | Stripe Connect onboarding return landing page |

---

## 📜 Available Scripts

- `pnpm dev` — Starts the local Next.js development server.
- `pnpm build` — Builds the production bundle.
- `pnpm start` — Runs the production build server.
- `pnpm lint` — Runs ESLint checks across the codebase.
