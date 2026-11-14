# QueueLess — Smart Virtual Queue Management Platform

QueueLess is a production-quality MVP platform that replaces physical waiting lines with digital, real-time queues.

Customers can scan a QR code on arrival, receive a live digital token on their smartphone, and wait freely while monitoring their real-time position and estimated wait time. Businesses get a centralized dashboard where staff can call, serve, and skip visitors, while administrators can track queue velocity and analyze peak-hour retention.

---

## 🌟 Key Features

### 📱 Customer Experience (Mobile-First)
- **Instant QR Code Check-in**: Zero app installation required. Customers point their phone camera at a printed poster or web link to access the queue.
- **Race-Condition Safe Token Generation**: Atomic PostgreSQL token incrementing prevents duplicate tokens when multiple customers join simultaneously.
- **Live Position & Countdown**: Real-time Socket.io synchronization displays the number of people ahead, estimated wait in minutes, and currently served counter token.
- **Audio & Visual Call Notifications**: Prominent pulsing banners and alert screens notify customers the moment their number is called to the counter.
- **Self-Service Leave Queue**: Customers can leave or cancel their token at any time, instantly recalculating wait times for everyone behind them.

### 🏢 Staff & Desk Operator Experience
- **Real-Time Service Desk**: Staff can view who is currently at the counter, how long customers have been waiting, and incoming check-ins.
- **One-Click Desk Actions**:
  - `Call Next Customer`: Automatically advances to the next waiting customer.
  - `Start Service`: Marks entry as `SERVING` and starts an exact timer in `ServiceLog`.
  - `Complete Service`: Records service completion, calculates elapsed duration, and auto-adjusts the queue's dynamic average service time.
  - `Skip Customer`: Flags no-shows as `SKIPPED` without stalling the line.
- **Pause & Resume Controls**: Staff or admins can temporarily pause new customer arrivals when lines become overloaded.

### 📊 Business Administration & Analytics
- **Live Summary Cards**: Today's customer volume, waiting count, active queues, and served count.
- **Peak Hour Analysis**: Arrival volume clustered by hour to pinpoint rush periods.
- **Abandonment Rate Tracking**: Measures drop-offs (skipped + cancelled) against total check-ins.
- **Dynamic Average Wait & Service Times**: Automatically calculates duration based on actual historical service logs.
- **Multi-Queue Management**: Businesses can operate multiple distinct queues (e.g., *General Consultation*, *Triage*, *Lab Bloodwork*, *Pharmacy Pick-up*).
- **Staff Delegation**: Business owners can assign staff accounts via email with role-based access.
- **Printable QR Code Poster**: Built-in high-contrast QR poster generator with one-click print and direct URL sharing.

---

## 🛠 Tech Stack

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Socket.io Client, Lucide React, QRCode.react |
| **Backend** | Node.js, Express.js (ES Modules), Socket.io, Zod, Express Rate Limit, CORS |
| **Database & ORM** | PostgreSQL, Prisma ORM 5 |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing, Role-based Middleware |
| **Real-Time** | WebSockets (Socket.io) with rooms partitioned per queue (`queue:{queueId}`) |

---

## 👥 User Roles & Permissions

QueueLess implements role-based authorization:

1. **`CUSTOMER`**:
   - Join public queues (guests or registered).
   - View live token position and leave queue.
   - View personal queue history.
2. **`STAFF`**:
   - View assigned business queues.
   - Call next customer, start service, complete service, and skip entries.
   - Pause or resume lines during rushes.
3. **`BUSINESS_ADMIN`**:
   - Create and configure businesses and queues.
   - Assign and manage staff members.
   - Access comprehensive business performance analytics.
   - Generate and print queue QR posters.
4. **`PLATFORM_ADMIN`**:
   - Full global administrative privileges across all businesses, queues, and users.

---

## 🗄️ Database Architecture

The data model uses PostgreSQL managed by Prisma ORM:

```mermaid
erDiagram
    User ||--o{ Business : "owns"
    User ||--o{ QueueEntry : "joins"
    User ||--o| Staff : "acts as"
    Business ||--o{ Queue : "hosts"
    Business ||--o{ Staff : "employs"
    Queue ||--o{ QueueEntry : "contains"
    QueueEntry ||--o| ServiceLog : "tracks"
    Staff ||--o{ ServiceLog : "conducts"
```

### Models & Schema:
- **`User`**: `id`, `name`, `email`, `phone`, `passwordHash`, `role`, `createdAt`, `updatedAt`
- **`Business`**: `id`, `name`, `category`, `address`, `ownerId`, `createdAt`
- **`Queue`**: `id`, `businessId`, `name`, `description`, `status` (`ACTIVE`, `PAUSED`, `CLOSED`), `averageServiceTime`, `maxCapacity`, `currentToken`, `createdAt`
- **`QueueEntry`**: `id`, `queueId`, `customerId`, `customerName`, `customerPhone`, `tokenNumber`, `status` (`WAITING`, `CALLED`, `SERVING`, `SERVED`, `SKIPPED`, `CANCELLED`), `joinedAt`, `calledAt`, `servedAt`
- **`Staff`**: `id`, `userId`, `businessId`, `createdAt`
- **`ServiceLog`**: `id`, `queueEntryId`, `staffId`, `serviceStart`, `serviceEnd`

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or v20+ recommended)
- **PostgreSQL** (v14+) running locally or via Docker / cloud (e.g., Supabase / Neon / AWS RDS)
- **npm** or **pnpm** / **yarn**

### 2. Clone and Install Dependencies

```bash
cd queueless

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

---

## ⚙️ Environment Variables

### Root / Server Environment (`server/.env` and `.env`)
Create `server/.env`:

```env
PORT=3001
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/queueless?schema=public"

# JWT configuration
JWT_SECRET=queueless-super-secret-jwt-key-production-ready-32-characters
JWT_EXPIRES_IN=7d

# Frontend URL (CORS & Socket.io)
CLIENT_URL=http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
```

---

## 🗃️ Database Setup & Migrations

Make sure PostgreSQL is running and your `DATABASE_URL` is set in `server/.env`.

Run Prisma migrations and generate the client:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to PostgreSQL database
npx prisma db push

# (Optional) Seed the database with ready-to-test accounts and demo queues
node prisma/seed.js
```

### Pre-configured Seed Accounts:
| Role | Email | Password |
|---|---|---|
| **Platform Admin** | `admin@queueless.com` | `admin123` |
| **Business Admin** | `business@example.com` | `password123` |
| **Staff Member** | `staff@example.com` | `password123` |
| **Customer** | `customer@example.com` | `password123` |

---

## 🏃 Running the Application

### Option A: Run Both Together (Concurrently)
From the root directory:

```bash
npm run dev
```

### Option B: Run Services Separately

**Backend Server (Port 3001):**
```bash
cd server
npm run dev
```
API running at `http://localhost:3001/api`  
Socket.io listening at `ws://localhost:3001`

**Frontend Client (Port 5173):**
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 API Reference Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No (Rate-limited) |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No (Rate-limited) |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Bearer Token |

### Business Management (`/api/businesses`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/businesses` | Create business profile | `BUSINESS_ADMIN` |
| `GET` | `/api/businesses/mine` | List user's businesses | `BUSINESS_ADMIN` |
| `GET` | `/api/businesses/:id` | Get business details & queues | Yes |
| `PATCH` | `/api/businesses/:id` | Update business info | `BUSINESS_ADMIN` |
| `POST` | `/api/businesses/:id/staff` | Assign staff by email | `BUSINESS_ADMIN` |
| `GET` | `/api/businesses/:id/staff` | List business staff members | `STAFF`, `BUSINESS_ADMIN` |

### Queue Configuration (`/api/queues`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/queues/public/:id` | Public preview before joining | **Public (No Auth)** |
| `POST` | `/api/queues` | Create new virtual queue | `BUSINESS_ADMIN` |
| `GET` | `/api/queues/business/:bizId`| Get queues for a business | `STAFF`, `BUSINESS_ADMIN` |
| `GET` | `/api/queues/:id` | Get queue and all entries | Yes |
| `PATCH` | `/api/queues/:id` | Update queue settings | `BUSINESS_ADMIN` |
| `DELETE` | `/api/queues/:id` | Delete queue (cascades) | `BUSINESS_ADMIN` |
| `POST` | `/api/queues/:id/pause` | Pause new check-ins | `STAFF`, `BUSINESS_ADMIN` |
| `POST` | `/api/queues/:id/resume` | Resume check-ins | `STAFF`, `BUSINESS_ADMIN` |

### Customer Check-in & Entries (`/api`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/queues/:id/join` | Join line (atomic token generation) | **Public / Optional Auth** |
| `GET` | `/api/queues/:id/status` | Live queue status & serving token | **Public** |
| `GET` | `/api/entries/:id` | Live status for specific token | **Public** |
| `DELETE`| `/api/entries/:id` | Leave / cancel queue entry | **Public** |

### Staff Actions (`/api`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/queues/:id/next` | Call next waiting customer | `STAFF`, `BUSINESS_ADMIN` |
| `POST` | `/api/entries/:id/start` | Start serving customer | `STAFF`, `BUSINESS_ADMIN` |
| `POST` | `/api/entries/:id/complete`| Complete service & log time | `STAFF`, `BUSINESS_ADMIN` |
| `POST` | `/api/entries/:id/skip` | Skip customer token | `STAFF`, `BUSINESS_ADMIN` |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/business/:bizId`| Daily summary, peak hours, rate | `BUSINESS_ADMIN`, `STAFF` |
| `GET` | `/api/analytics/queue/:qId` | Single queue telemetry | `BUSINESS_ADMIN`, `STAFF` |
| `GET` | `/api/analytics/dashboard/:bizId`| High-level counters | `BUSINESS_ADMIN` |

---

## ⚡ Real-Time Architecture (Socket.io)

PostgreSQL is strictly maintained as the source of truth. Socket.io broadcasts state transitions to rooms:

```text
Room: queue:{queueId}
```

Events emitted to clients:
- `queue:updated`: Emitted whenever customers join, leave, are called, or when queue configs change. Connected clients immediately invalidate cache and fetch updated data.
- `entry:updated`: Emitted on state changes (`CALLED`, `SERVING`, `SERVED`, `SKIPPED`, `CANCELLED`). Triggers the customer's device to alert them when their number is called.

---

## 🧪 Testing the Complete Workflow

1. **Sign in as Business Admin**:
   - Go to `http://localhost:5173/login`.
   - Log in with `business@example.com` / `password123`.
   - View your dashboard with pre-seeded queues (*General Consultation*).
2. **Open the QR Code Poster**:
   - Click the QR icon or go to `/dashboard/queues/{queueId}/qr`.
   - Click **"Test Link"** or copy the public link.
3. **Simulate a Customer (in an Incognito window or mobile browser)**:
   - Open the link: `http://localhost:5173/queue/{queueId}/join`.
   - Enter a name (e.g., "John Smith") and click **"Get Digital Token"**.
   - Note the token number (e.g., `#4`), people ahead, and estimated wait time.
4. **Operate the Staff Desk (in main window)**:
   - Go to `/dashboard/queues/{queueId}`.
   - Notice John Smith immediately appears under **Waiting Customers** via real-time WebSocket.
   - Click **"Call Next Customer"**.
   - Notice the incognito window **instantly changes to the blue "IT'S YOUR TURN!" screen** with counter instructions.
   - Click **"Start Service"** -> turns green "Being Served".
   - Click **"Complete Service"** -> marks as served and logs duration to analytics.
5. **View Analytics**:
   - Go to `/dashboard/analytics`.
   - View updated customer throughput, average wait times, and peak hours.

---

## 🔮 Future Improvements
- **Twilio SMS / WhatsApp Alerts**: Send SMS notifications when customer is 2 tokens away from the counter.
- **Machine Learning Wait Time Predictor**: Replace the rule-based `peopleAhead × avgServiceTime` with an ML model trained on time-of-day, day-of-week, and staff velocity.
- **Multi-Counter TV Kiosk Display**: Dedicated `/display/:queueId` full-screen kiosk view designed for lobby TV screens with chimes and voice announcements.
- **Multi-lingual Support**: English, Spanish, French, and Hindi localization for international customers.

