# SUBTRACK: A Personal Subscription Management & Spend Optimizer

> **Tagline:** *Track. Understand. Optimize.*  
> **Academic Level:** Master of Computer Applications (MCA) — Fifth-Semester Mini Project  
> **Status:** Production-Ready Academic Demonstration & Viva Submission

---

## 1. Project Background & Problem Statement

In today's digital economy, consumers and developers subscribe to multiple recurring software and entertainment services—including streaming platforms (Netflix, Spotify), developer environments (GitHub Copilot, AWS), cloud storage (Google One), and productivity suites (Microsoft 365, Canva).

### The Recurring Payment Problem:
1. **Forgotten Subscriptions:** Recurring charges happen automatically on variable billing cycles (Weekly, Monthly, Quarterly, Half-Yearly, Yearly) without unified visibility.
2. **Surprise Free-Trial Conversions:** Users register for free trials and forget to cancel prior to expiration, leading to unexpected charges.
3. **Unused Recurring Expenses:** Services sit idle for months, quietly draining finances.
4. **Lack of Centralized Metrics:** No single dashboard calculates normalized monthly and annual commitments across diverse billing frequencies.

### How SUBTRACK Solves This:
- **Centralized Registry:** Consolidates all recurring services with categories, currencies, renewal schedules, and notes.
- **Cost Normalization Engine:** Converts weekly, quarterly, and annual billing cycles into standard monthly and annual equivalents.
- **Visual Renewal Calendar:** Renders month and list views with color-coded urgency badges.
- **Rule-Based Inactivity Detection:** Flags subscriptions whose last-recorded usage exceeds the user's configurable inactivity threshold (default: 30 days) and calculates potential annual savings.
- **Safe Provider Redirection:** Directs users to the provider's official portal with 1 click to manage or cancel subscriptions. *(SubTrack does not store credit cards or perform automatic bank withdrawals).*
- **Configurable Email & In-App Reminders:** Automated daily cron scheduler checking upcoming renewals and trial expirations.
- **Academic Evaluation Module:** Evaluates system effectiveness by comparing user-entered unwanted charges and unused spend before vs after adopting SubTrack.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + TypeScript** | Component-driven reactive single-page application |
| **Build Tool** | **Vite** | Blazing-fast development and optimized production bundling |
| **Styling** | **Tailwind CSS** | Clean financial SaaS aesthetics with light & dark mode support |
| **Icons** | **Lucide React** | Modern, accessible SVG icons |
| **Charts** | **Recharts** | Interactive spending donut charts, monthly bars, and trend lines |
| **Routing** | **React Router v6** | Client-side routing with authentication guards |
| **HTTP Client** | **Axios** | REST API communication with automated JWT token interceptors |
| **Form Validation** | **React Hook Form + Zod** | Client and server schema validation |
| **Backend Runtime** | **Node.js + Express (TS)** | RESTful API server with TypeScript type safety |
| **Authentication** | **JWT + bcryptjs** | Secure token-based auth with salted password hashing |
| **Database** | **MongoDB + Mongoose** | Document data store with indexed user-scoped schemas |
| **Zero-Config DB** | **mongodb-memory-server** | Embedded development DB fallback for seamless viva demo |
| **Scheduling** | **node-cron** | Automated daily background jobs for renewal & trial checks |
| **Email Service** | **Nodemailer** | SMTP email alerts + Development Console Simulation Mode |
| **Testing** | **Jest + ts-jest** | Unit and integration test suite |

---

## 3. System Architecture & Data Flow

```
+-------------------------------------------------------+
|            React 18 Single Page Application           |
|  (Dashboard, Registry, Calendar, Analytics, Settings) |
+-------------------------------------------------------+
                           |
                           | REST API (JSON / JWT Bearer)
                           v
+-------------------------------------------------------+
|             Node.js + Express API Server              |
|  * Auth Middleware       * Input Validation (Zod)     |
|  * Calculation Service   * Central Error Handler      |
+-------------------------------------------------------+
            |                  |                  |
            | Mongoose         | Node-Cron        | Nodemailer
            v                  v                  v
+-----------------------+ +-------------+ +---------------------+
|   MongoDB Database    | | Daily Jobs  | | Email Service /     |
| (Local / Atlas / Mem) | | (Renewals & | | Development Console |
| * Users               | |  Trials &   | | Simulation Logger   |
| * Subscriptions       | |  Usage)     | +---------------------+
| * Notifications       | +-------------+
| * EvaluationRecords   |
+-----------------------+
```

---

## 4. Mathematical Business Logic

### Cost Normalization Formulas:
To accurately compare subscriptions across disparate cycles:

$$\text{Monthly Equivalent} = \begin{cases} 
\frac{\text{cost} \times 52}{12} & \text{if Weekly} \\
\text{cost} & \text{if Monthly} \\
\frac{\text{cost}}{3} & \text{if Quarterly} \\
\frac{\text{cost}}{6} & \text{if Half-Yearly} \\
\frac{\text{cost}}{12} & \text{if Yearly}
\end{cases}$$

$$\text{Annual Equivalent} = \text{Monthly Equivalent} \times 12$$

### Days Until Renewal:
$$\Delta_{\text{days}} = \lceil (\text{renewalDate} - \text{currentDate})_{\text{UTC}} / 86400000 \rceil$$

### Rule-Based Inactivity Engine:
1. **Never Used:** If `lastUsedDate` is null and subscription age $> \text{threshold}$, status is set to `'Never Used'` and flagged.
2. **Not Used Recently:** If $(\text{currentDate} - \text{lastUsedDate}) > \text{inactivityThreshold}$ (default: 30 days), flagged as `'Not Used Recently'`.
3. **Used Recently:** Status marked as active and healthy.
4. **Potential Annual Savings:** Sum of $\text{Annual Equivalent}$ for all active flagged subscriptions.

---

## 5. Project Directory Structure

```
Subtrack/
├── client/                      # React 18 TypeScript Frontend
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, StatCard, UrgencyBadge, Modals
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── layouts/             # AppLayout, AuthLayout
│   │   ├── pages/               # Landing, Login, Register, Dashboard, Registry,
│   │   │                        # Calendar, Analytics, Evaluation, Settings
│   │   ├── services/            # Axios API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Formatters & calculation helpers
│   │   ├── App.tsx              # Router configuration
│   │   ├── main.tsx             # DOM entry point
│   │   └── index.css            # Tailwind directives
│   ├── tailwind.config.js       # Tailwind configuration & theme
│   ├── vite.config.ts           # Vite development server & proxy
│   └── package.json
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # DB connection with in-memory fallback, env loader
│   │   ├── controllers/         # Auth, Subscriptions, Dashboard, Analytics,
│   │   │                        # Calendar, Notifications, Evaluation
│   │   ├── middleware/          # JWT auth, Zod validation, Centralized errors
│   │   ├── models/              # User, Subscription, Notification, EvaluationRecord
│   │   ├── routes/              # Express API route definitions
│   │   ├── services/            # Calculations, Email templates, Reminders
│   │   ├── jobs/                # Node-cron daily scheduled jobs
│   │   ├── utils/               # Logger, Database seed script
│   │   ├── validators/          # Zod validation schemas
│   │   ├── app.ts               # Express configuration
│   │   └── server.ts            # Server bootstrapper
│   ├── tests/                   # Jest unit & business logic tests
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example                 # Environment variables blueprint
├── .gitignore
├── package.json                 # Monorepo runner scripts
└── README.md                    # Project documentation & viva guide
```

---

## 6. Quick Start & Execution Guide

### Prerequisites
- Node.js (v18 or higher) and npm installed.

### Step 1: Install Dependencies
From the project root:
```bash
npm run install:all
```
*(Or run `npm install` in root, `cd server && npm install`, `cd ../client && npm install`)*

### Step 2: Seed the Demo Data
```bash
npm run seed
```
This populates MongoDB with:
- Demo User: `demo@subtrack.local` / `Demo@12345`
- 8 realistic subscriptions (Netflix, Spotify, AWS, Adobe CC, Canva Pro, Google One, GitHub Copilot, Microsoft 365).
- Mix of active renewals, upcoming renewals in 3 days, trial expiring in 4 days, and subscriptions flagged as unused.
- MCA Before vs After research evaluation dataset.

### Step 3: Run the Application
You can run both Backend and Frontend concurrently with **one command**:
```bash
npm run dev
```

Or run them in separate terminal tabs:
```bash
# Terminal 1: Backend Server
cd server
npm run dev
# Starts at http://localhost:5000

# Terminal 2: Frontend Client
cd client
npm run dev
# Starts at http://localhost:5173
```

---

## 7. Demo Account Credentials

| Attribute | Value |
| :--- | :--- |
| **Email** | `demo@subtrack.local` |
| **Password** | `Demo@12345` |
| **Auto-Fill Feature** | Click **"Auto-Fill Demo"** on the Login page for 1-click access |

---

## 8. REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `POST /api/auth/forgot-password` — Request a 6-digit password reset code.
- `POST /api/auth/reset-password` — Verify code and set new password.
- `PUT /api/auth/profile` — Update name, preferred currency, reminder lead days, inactivity threshold, and email toggle.

### Subscriptions
- `GET /api/subscriptions` — List subscriptions (supports `search`, `category`, `billingCycle`, `usageStatus`, `sort`).
- `GET /api/subscriptions/:id` — Retrieve single subscription with calculated monthly/annual equivalents.
- `POST /api/subscriptions` — Create a new subscription.
- `PUT /api/subscriptions/:id` — Update subscription details.
- `DELETE /api/subscriptions/:id` — Delete subscription (cascade removes associated notifications).
- `PATCH /api/subscriptions/:id/mark-used` — Update `lastUsedDate = now` and reset inactivity timer.

### Dashboard & Analytics
- `GET /api/dashboard/summary` — 7 stat cards (active, monthly, annual, upcoming, trials, potential savings, unused count).
- `GET /api/dashboard/upcoming-renewals` — Next 10 renewals with urgency indicators.
- `GET /api/dashboard/unused` — Subscriptions exceeding inactivity threshold with potential savings.
- `GET /api/analytics/category` — Normalized monthly expenditure by category with percentages.
- `GET /api/analytics/monthly` — Commitment distribution across billing cycles.
- `GET /api/analytics/trend` — 6-month projected expenditure timeline.
- `GET /api/analytics/distribution` — Count distribution in price tiers.

### Calendar & Notifications
- `GET /api/calendar/events` — Unified timeline of renewals and trial expirations.
- `GET /api/notifications` — Retrieve notification history and unread counter.
- `PATCH /api/notifications/:id/read` — Mark a single notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.
- `POST /api/notifications/trigger-scan` — **Viva Demo Button**: Manually triggers reminder checks and outputs email simulations.

### Evaluation
- `GET /api/evaluation` — Retrieve Before vs After research metrics and reduction percentages.
- `POST /api/evaluation` — Update user-entered evaluation comparison dataset.

---

## 9. Viva Examination Q&A Guide (For MCA Students)

### Q1: Why did you choose React for the frontend?
**Answer:** React's component-based architecture enables modular design where components like `StatCard`, `UrgencyBadge`, and `Modal` are cleanly reused. Its virtual DOM and state management allow real-time recalculations (e.g. clicking "Mark as Used" immediately updates the dashboard's potential annual savings without full page refreshes).

### Q2: How does JWT authentication work in SubTrack?
**Answer:** When the user logs in, the server verifies their credentials against the bcrypt password hash. Upon success, it issues a signed JSON Web Token (JWT) encoding the `userId` with an expiration time. The frontend stores this token in `localStorage` and an Axios interceptor attaches it as a `Bearer` token in the `Authorization` header for subsequent requests. The backend `authenticateToken` middleware verifies the cryptographic signature before executing any protected route.

### Q3: How do you normalize subscription costs across different billing cycles?
**Answer:** All subscriptions are converted into a standardized monthly equivalent:
- Weekly: $(\text{cost} \times 52) / 12$
- Monthly: $\text{cost}$
- Quarterly: $\text{cost} / 3$
- Half-Yearly: $\text{cost} / 6$
- Yearly: $\text{cost} / 12$  
Annual commitment is simply $\text{Monthly Equivalent} \times 12$. This ensures consistent comparisons across services.

### Q4: How does the rule-based unused subscription detection work?
**Answer:** We deliberately use a deterministic, explainable rule-based approach rather than black-box AI. The system checks $\Delta = \text{currentDate} - \text{lastUsedDate}$. If $\Delta$ exceeds the user's configured `inactivityThreshold` (default: 30 days) or if the service has never been used, it flags the subscription as "Potentially Unused" and sums the annual commitment as "Potential Savings". Clicking "Mark as Used" resets `lastUsedDate` to the current timestamp.

### Q5: How does SubTrack handle email notifications during local testing?
**Answer:** SubTrack features an **Email Simulation Mode**. If SMTP environment variables are unconfigured, the system does not crash; instead, it outputs formatted ASCII email previews to the backend terminal (`[EMAIL SIMULATION]`) and records the alert in the in-app Notification Center. When real SMTP credentials are provided, Nodemailer dispatches actual emails.

### Q6: How is user data security maintained?
**Answer:** 
1. **Password Hashing:** Passwords are never stored in plain text; they are salted and hashed using `bcryptjs` (10 rounds).
2. **User-Level Authorization:** All database queries are strictly scoped to `req.user._id`. A user can never access or delete another user's subscription by altering the ID in the URL.
3. **HTTP Security:** Protected with `helmet` for secure headers and `express-rate-limit` to prevent brute-force attacks on auth endpoints.

---

## 10. Automated Tests

Run the test suite with:
```bash
cd server
npm test
```
All 10 unit and business logic tests validate:
- Cost normalization for Weekly, Monthly, Quarterly, Half-Yearly, and Yearly cycles.
- Negative and zero cost edge cases.
- Rule-based inactivity status evaluation (`Never Used`, `Not Used Recently`, `Used Recently`).
- Password salting, hashing, and verification with bcrypt.

---

## 11. Scope Limitations & Future Enhancements

### Out of Scope by Design:
- **No Direct Bank Account Scraping:** Designed as a personal tracker to ensure privacy without requiring sensitive bank credentials.
- **No Automatic Cancellation:** SubTrack intentionally provides official provider links so users retain sovereign control over cancellation decisions.

### Documented Future Enhancements:
- Native mobile application using React Native.
- Web push notifications via Service Workers.
- Multi-user family accounts with shared subscription quotas.
- Receipt OCR scanning for automatic subscription import.

---

**SUBTRACK** — *Track. Understand. Optimize.*  
Developed for MCA Fifth-Semester Mini Project Evaluation.
