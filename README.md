# 🍽️ SmartTable AI — Real-Time Smart Dining & Floor Telemetry Platform

SmartTable AI is an enterprise-grade, real-time smart dining platform connecting diners, restaurant owners, and platform administrators across Chennai. It features live table floor map visualization, instant bookings with digital QR entry passes, tableside digital menu pre-ordering, deterministic wait-time forecasting, concurrency-safe database transactions, and real MySQL-backed analytics.

---

## 🏛️ System Architecture

SmartTable AI is structured as a modern decoupled full-stack application:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SmartTable Frontend                             │
│       React 19 • Vite • Tailwind CSS • Lucide Icons • Canvas Confetti  │
│  ├── Customer Portal (Floor Map Viewer, Crowd Radar, AI Predictor)     │
│  ├── Restaurant Owner Dashboard (Kitchen Dispatch, Table Bill, Floor)  │
│  └── Super Admin Portal (Platform KPIs, Users, Owners, Approvals)      │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │ REST API                       │ WebSockets (Socket.IO)
                    │ (JWT Bearer Token)             │ (Bi-directional Pub/Sub)
┌───────────────────▼────────────────────────────────▼───────────────────┐
│                        SmartTable Backend                              │
│         Node.js • Express • Socket.IO • mysql2/promise Connection Pool │
│  ├── Auth & RBAC Middleware (Role Isolation & Ownership Verification)  │
│  ├── Concurrency Engine (Pessimistic FOR UPDATE Locks & Deadlock Retry)│
│  ├── Deterministic AI Engine (Real-Time Crowd & Wait-Time Forecasts)   │
│  └── Analytics Engine (GMV, AOV, Hourly Profile, Table Demographics)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ MySQL Connection Pool (3306)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MySQL Relational Database                       │
│  ├── restaurants (Listing, geolocation, cuisine, hours, crowd level)   │
│  ├── tables (Floor mapping, shape, capacity, occupancy timestamps)     │
│  ├── reservations (Bookings, party size, statuses, pre-order cart)     │
│  ├── orders (Fulfillment, payment amounts, dishes, statuses)           │
│  ├── users (Diners, Owners, Super Admins with bcrypt password hashes)  │
│  ├── disputes (Flagged transactions and refund settlement tickets)     │
│  └── High-frequency B-tree indexes for lightning query performance     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 1. 📍 Hyperlocal Discovery & Live Table Radar
- **Live Floor Vacancy**: Visual grid and interactive map of vacant, occupied, reserved, and cleaning tables.
- **Dynamic Table Countdown Clocks**: Real-time remaining dining minutes computed from active table sessions.
- **Hyperlocal Distance Engine**: Calculates accurate driving distances and directions.

### 2. ⚡ Instant Bookings & Kitchen Pre-Orders
- **Zero-Wait Table Booking**: Book tables with party size matching and instant digital QR entry passes.
- **Pre-Order Food Cart**: Pre-order signature dishes during reservation so the kitchen preps freshly upon seating.
- **Tableside Billing & Payments**: Multi-option billing (UPI QR with instant app deep-links, Cards, NetBanking, promo vouchers).

### 3. 🛡️ Concurrency Safety & Reliability (Phase 9)
- **Pessimistic Locking**: `SELECT ... FOR UPDATE` prevents double-booking race conditions under high concurrent load.
- **Automatic Deadlock Retries**: 3-attempt exponential backoff retry handler for concurrent MySQL transactions.
- **Double-Click Request Deduplication**: Idempotent duplicate window prevents accidental multi-reservations and orders.
- **Resilient Connection Pooling**: Persistent MySQL pool with health checks and auto-reconnection.

### 4. 📊 Authoritative Analytics & Smart Predictions (Phase 11)
- **Zero Mock Data**: 100% computed from actual database records (`orders`, `reservations`, `tables`, `users`).
- **Owner Property Analytics**: Real gross revenue (GMV), Average Order Value (AOV), dine-in/takeaway/delivery breakdown, cancellation rates, hourly traffic histogram (11 AM - 10 PM), and party size demographics.
- **Super Admin Platform Analytics**: Consolidated GMV, 15% platform take-rate revenue, network table occupancy rate, and verified user demographics.
- **Deterministic Forecasts**: Deterministic crowd status (`Low`, `Moderate`, `High`, `Peak`), cuisine-aware table turnover cycle estimates, and lowest-wait dining windows.

### 5. 📱 Mobile & Responsive Readiness (Phase 10)
- **Fully Responsive**: Verified layouts across Desktop (1440px), Laptop (1024px), Tablet (768px), and Mobile (390px).
- **Mobile Navigation Drawer**: Quick 1-tap access to Crowd Radar, AI Predictor, My Bookings, and Partner Registration.
- **Touch-Optimized Targets**: Comfortable buttons, non-overflowing modal dialogues, and smooth horizontal table scrollers.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0+ or v20.0+ (Tested on Node v24)
- **MySQL Server**: MySQL 8.x / MariaDB (e.g., via XAMPP or native MySQL service on port 3306)
- **Git**: Installed

### Step 1: Database Initialization
1. Ensure your MySQL service is running on `localhost:3306`.
2. Create the `smarttable` database and import the schema:
   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS smarttable;"
   mysql -u root smarttable < backend/database/schema.mysql.sql
   ```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```ini
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smarttable
JWT_SECRET=local-development-secret-smarttable-key-2026
BCRYPT_ROUNDS=10
```

**Frontend (`.env`):**
```ini
# Optional in dev (Vite proxies /api to http://localhost:5000)
# VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=
```

### Step 3: Install Dependencies & Start Services

**Terminal 1 — Backend API & Socket.IO Server:**
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 — Frontend Dev Server:**
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` or `http://localhost:5174`*

---

## 🔑 Default Credentials & Role Access

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Super Admin** | `admin@smarttable.in` | `admin123` | Platform KPIs, Diners Directory, Owners Governance, Restaurant Approvals, Dispute Settlements |
| **Restaurant Owner** | `owner@restaurant.com` | `owner123` | Assigned Restaurant Floor Plan, Kitchen Orders Dispatch, Table Billing, Property Analytics |
| **Diner / Customer** | `user@example.com` | `user123` | Restaurant Discovery, Table Floor Map, Booking & Pre-orders, Digital QR Pass, Pay Bill |

---

## 📡 REST API & Socket.IO Specification

### Core Endpoints

#### Authentication & Profiles
- `POST /api/auth/register` — Register a diner or restaurant owner
- `POST /api/auth/login` — Login with email/password & receive JWT
- `GET /api/auth/me` — Get active authenticated user profile

#### Restaurants & Telemetry
- `GET /api/restaurants` — List all dining properties with live occupancy
- `GET /api/restaurants/:id` — Get restaurant profile, full menu, and tables
- `GET /api/restaurants/:id/wait-time` — Live deterministic wait telemetry
- `GET /api/restaurants/:id/analytics` — Owner Property Analytics *(Protected: Owner/Admin)*

#### Tables & Live Floor
- `GET /api/tables/:restaurantId` — Get all tables and current statuses
- `PATCH /api/tables/:restaurantId/:tableId/status` — Atomic table status transition *(Protected)*

#### Bookings & Orders
- `POST /api/reservations` — Atomic booking creation with concurrency lock
- `GET /api/reservations` — Get user or restaurant reservations *(Protected)*
- `PATCH /api/reservations/:id/status` — Accept/Decline booking *(Protected)*
- `POST /api/orders` — Create new tableside or pre-order food order
- `POST /api/ai/predict-walk-in` — Deterministic walk-in table availability calculator

#### Super Admin Management
- `GET /api/admin/platform-analytics` — Platform-wide consolidated metrics *(Protected: Admin)*
- `GET /api/admin/analytics/:id` — Inspect any restaurant analytics *(Protected: Admin)*
- `GET /api/admin/users` — Manage diner accounts *(Protected: Admin)*
- `GET /api/admin/owners` — Manage verified restaurant partners *(Protected: Admin)*
- `PATCH /api/admin/restaurants/:id/status` — Approve/suspend restaurants *(Protected: Admin)*

### Real-Time Socket.IO Channels
- `restaurant_{id}_public` — Public broadcasts for live table vacancy, wait times, and crowd density.
- `restaurant_{id}_private` — Authenticated owner/staff channel for incoming kitchen orders, table requests, and billing chimes.

---

## 📱 Mobile & Capacitor Packaging Guide

SmartTable is engineered to run seamlessly as a Progressive Web App (PWA) or wrapped as a native Android APK using Capacitor:

### Android Packaging Steps (When Android Studio is configured):
1. **Build Production Web Assets:**
   ```bash
   npx vite build
   ```
2. **Initialize Capacitor (One-time setup):**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "SmartTable" "com.smarttable.app" --web-dir "dist"
   npx cap add android
   ```
3. **Configure Backend URL for Mobile:**
   Set `VITE_API_URL=https://your-production-domain.com` in `.env` before running `npx vite build` so mobile devices reach the external API.
4. **Sync & Build Android APK:**
   ```bash
   npx cap sync android
   npx cap open android
   ```
   *In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s).*

> **Environment Note:** In environments where the native Android SDK or Android Studio is not installed locally, SmartTable functions with full responsive fidelity in all mobile web browsers (iOS Safari, Android Chrome).

---

## 🧪 Comprehensive Automated Test Suites

SmartTable includes dedicated automated test suites covering all implementation phases:

```bash
# 1. Phase 6: Super Admin & MySQL Governance Tests
node backend/test_phase6.js

# 2. Phase 8: RBAC Security, IDOR Protection & Rate Limiting Tests
node backend/test_phase8_security.js

# 3. Phase 9: Concurrency Safety, Pessimistic Locks & Deduplication Tests
node backend/test_phase9_reliability.js

# 4. Phase 11: Real MySQL Analytics & Deterministic Prediction Tests
node backend/test_phase11_analytics.js

# 5. Frontend Production Bundle Verification
npx vite build
```

---

## 📦 Production Release Summary

- **Status**: Production Ready ✅
- **Database Engine**: MySQL Relational Backend with Connection Pooling
- **Concurrency Protection**: Strict `FOR UPDATE` Transaction Isolation
- **Role Isolation**: Enforced RBAC across Diners, Owners, and Super Admins
- **Analytics Integrity**: 100% Real MySQL-backed Metrics
- **Build Quality**: 0 Errors, 0 Lint Warnings

---
*Developed for SmartTable AI Dining Systems.*
