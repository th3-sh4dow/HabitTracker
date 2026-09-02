# Evergreen Habit Tracker 🌿

A full-stack habit tracking application where users define habits, check in daily, and track accurate consecutive streaks — all calculated in their **local timezone**, not in elapsed hours.

## ✨ Features

- **Auth** — Register and login with a JWT-secured account. Password stored as bcrypt hash.
- **IANA Timezone** — Each user has a timezone set at signup. All streak logic runs in that timezone.
- **Habit CRUD** — Create habits with name & optional description.
- **Daily Check-ins** — One check-in per local calendar day, enforced at both the application and database level (`UNIQUE(habitId, localDate)`).
- **Backfilling** — Log past dates when creating a habit (or from the dashboard). Server validates no future or pre-creation dates.
- **Server-side Streaks** — `currentStreak` and `longestStreak` are computed on the server. The frontend never decides streak state.
- **7-Day Progress Grid** — Visual week view showing recent completion per habit.
- **Responsive UI** — Works on mobile and desktop with bottom-nav and sidebar respectively.

---

## 🏗️ Architecture

```
HabitTracker/
├── backend/                 ← Express API (Node.js)
│   ├── prisma/
│   │   └── schema.prisma    ← DB schema (User, Habit, CheckIn)
│   └── src/
│       ├── index.js         ← Express entry point
│       ├── middleware/auth.js ← JWT verification
│       ├── routes/
│       │   ├── auth.js      ← /api/auth/*
│       │   ├── habits.js    ← /api/habits/*
│       │   └── checkins.js  ← /api/habits/:id/checkins/*
│       └── services/
│           └── streaks.js   ← Pure timezone-aware streak logic
└── src/                     ← React + Vite frontend
    ├── api/client.js         ← Fetch-based API client
    ├── context/AuthContext.jsx ← Auth state provider
    └── pages / components   ← UI (Evergreen design system)
```

---

## 🛠️ Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| PostgreSQL | 14+ |

> **PostgreSQL setup**: Create a database named `habittracker`. Default connection assumes `postgres:postgres@localhost:5432`.

---

## 🚀 Quick Start

### 1. Clone / navigate to the project

```bash
cd HabitTracker
```

### 2. Set up the backend

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, etc.

# Run database migrations (creates tables)
npx prisma migrate dev --name init

# Generate the Prisma client
npx prisma generate

# Start the API server (port 3001)
npm run dev
```

### 3. Set up the frontend

In a new terminal:

```bash
cd HabitTracker   # project root

# Install dependencies (already done if you ran npm install before)
npm install

# Start the Vite dev server (port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ⚙️ Environment Variables

### `backend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/habittracker?schema=public` |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string) | `change_this_to_a_long_random_secret` |
| `PORT` | Port for the API server | `3001` |
| `FRONTEND_URL` | Frontend origin (for CORS) | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |

---

## 🗃️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  timezone  String   // IANA, e.g. "Asia/Kolkata"
  createdAt DateTime @default(now())
  habits    Habit[]
}

model Habit {
  id          String    @id @default(cuid())
  name        String
  description String?
  userId      String
  createdAt   DateTime  @default(now())
  checkIns    CheckIn[]
}

model CheckIn {
  id        String   @id @default(cuid())
  habitId   String
  checkedAt DateTime @default(now())    // UTC instant
  localDate String                      // YYYY-MM-DD in user's timezone

  @@unique([habitId, localDate])        // DB-level: one check-in per local day
}
```

---

## 🕐 How Local-Day Streaks Work

The single most important design decision: **streaks are measured in local calendar days, not elapsed hours**.

### The Problem with Hours

Two check-ins 20 hours apart might be:
- **Same local day** (both on Tuesday) → NOT a streak increment
- **Consecutive local days** (one on Tuesday, one on Wednesday) → YES, streak continues

### The Solution

1. **Timezone stored at registration**: Every user picks an IANA timezone (e.g. `Asia/Kolkata`).

2. **localDate computed server-side**: When a check-in is created, the server converts the current UTC time to the user's local calendar date using `Intl.DateTimeFormat`:
   ```js
   function toLocalDateString(utcDate, timezone) {
     return new Intl.DateTimeFormat('en-CA', {
       timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
     }).format(utcDate); // → "YYYY-MM-DD"
   }
   ```

3. **Both stored**: `checkedAt` (UTC instant for auditing) and `localDate` (YYYY-MM-DD for streak logic).

4. **DB constraint**: `@@unique([habitId, localDate])` makes duplicates physically impossible.

5. **Streak computation**: A pure function works only on `localDate` strings — no timestamps:
   ```
   currentStreak = count of consecutive local days ending today (or yesterday)
   longestStreak = longest consecutive run ever
   ```

### Worked Example (Asia/Kolkata, UTC+05:30)

| Check-in | UTC time | Local time (IST) | localDate | Streak |
|----------|----------|------------------|-----------|--------|
| A | 2026-03-10T14:30Z | 2026-03-10 20:00 | 2026-03-10 | 1 |
| B | 2026-03-11T10:30Z | 2026-03-11 16:00 | 2026-03-11 | 2 ✅ |
| C | 2026-03-11T21:30Z | 2026-03-12 03:00 | 2026-03-12 | 3 ✅ |
| D | 2026-03-12T17:30Z | 2026-03-12 23:00 | 2026-03-12 | **Duplicate → 409** |

B and C are only 11 hours apart but span two local days → streak continues.  
C and D are 20 hours apart but are the same local day → rejected.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{email, password, timezone}` | `{token, user}` |
| POST | `/api/auth/login` | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | — | `{user}` |
| PATCH | `/api/auth/me` | `{timezone?, currentPassword?, newPassword?}` | `{user}` |

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | List all user habits with streaks |
| POST | `/api/habits` | Create habit `{name, description?}` |
| GET | `/api/habits/:id` | Get habit + check-in history |
| PATCH | `/api/habits/:id` | Update `{name?, description?}` |
| DELETE | `/api/habits/:id` | Delete habit (cascades check-ins) |

### Check-ins

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/habits/:id/checkins` | Create check-in `{localDate?: "YYYY-MM-DD"}` |
| GET | `/api/habits/:id/checkins` | Paginated history `?page=1&limit=30` |
| DELETE | `/api/habits/:id/checkins/:cid` | Delete a check-in |

### Validation Errors

| Code | Meaning |
|------|---------|
| 400 | Invalid input / future date / pre-creation date |
| 401 | Missing or invalid JWT |
| 403 | Habit belongs to another user |
| 409 | Duplicate check-in for the same local day |

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests cover: basic streaks, gap breaks, backfill, same-day deduplication, timezone conversion, worked example from the spec (Asia/Kolkata), DST edge cases.

---

## 📁 Project Structure

```
HabitTracker/
├── backend/
│   ├── .env                 (gitignored)
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.js
│       ├── lib/prisma.js
│       ├── middleware/auth.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── habits.js
│       │   └── checkins.js
│       └── services/
│           ├── streaks.js
│           └── streaks.test.js
├── src/                     (React frontend)
│   ├── api/client.js
│   ├── context/AuthContext.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   └── EvergreenHabitLanding.jsx
│   └── components/
│       ├── DashboardContent.jsx
│       ├── NewHabitPage.jsx
│       ├── Settings.jsx
│       ├── SideNav.jsx
│       └── MobileNavigation.jsx
├── vite.config.js
└── README.md
```

---

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- All secrets via environment variables (never hardcoded)
- Constant-time password comparison prevents timing attacks
- Each user can only access their own habits
- Database-level uniqueness constraint as backstop for duplicate check-ins

---

## 🧩 Bonus Features Implemented

- ✅ Database-level enforcement of one-check-in-per-local-day (`@@unique`)
- ✅ Paginated check-in history endpoint
- ✅ Isolated, pure streak logic (easily unit-testable)
- ✅ DST-safe timezone conversion using `Intl.DateTimeFormat`
- ✅ Browser timezone auto-detection on register page
- ✅ Streak unit tests covering spec's worked example
