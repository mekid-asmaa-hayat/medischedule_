# MediSchedule — Medical Clinic Management Platform

A full-stack Next.js 15 application for managing a medical clinic: appointments, doctors, patients, staff, and more.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | Auth.js v5 (NextAuth) |
| Validation | Zod |
| Forms | React Hook Form |

## Features

- **Role-based access control** — Admin, Doctor, Staff, Patient
- **Authentication** — Register, login, JWT sessions, protected routes
- **Appointment booking** — Online booking, double-booking prevention, status management
- **Doctor management** — Profiles, specialties, weekly availability, time-off
- **Patient management** — Profiles, medical history, appointment history
- **Consultation notes** — SOAP-format notes per appointment
- **Notifications** — In-dashboard bell with read/delete
- **Responsive UI** — Works on mobile, tablet, desktop

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted DB such as [Neon](https://neon.tech) — free tier works)
- npm

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because some Radix UI packages still
> advertise peer deps for React 18 even though React 19 works fine.

### 3. Configure environment

Edit `.env.local` (already present in the project root):

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/medischedule"

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="your-random-32-plus-char-secret"

AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

**Quick secret generation (no openssl needed):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set up the database

```bash
# Push schema to your database (creates all tables)
npm run db:push

# Prisma client is auto-generated via postinstall, but you can also run:
# npm run db:generate

# Seed with demo data (doctors, patients, appointments, etc.)
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Using a cloud DB (Neon — free)

1. Go to [neon.tech](https://neon.tech), create a free project
2. Copy the connection string from the dashboard
3. Paste it into `.env.local` as `DATABASE_URL`
4. Run `npm run db:push && npm run db:seed`

## Demo Accounts

After seeding, use these accounts to log in:

| Role | Email | Password |
|---|---|---|
| Admin | admin@medischedule.com | Admin1234! |
| Doctor | james.wilson@medischedule.com | Doctor1234! |
| Staff | staff@medischedule.com | Staff1234! |
| Patient | patient@medischedule.com | Patient1234! |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public marketing pages
│   ├── (auth)/            # Login & register
│   ├── (dashboard)/       # Protected role dashboards
│   │   ├── admin/         # Admin-only pages
│   │   ├── doctor/        # Doctor-only pages
│   │   ├── patient/       # Patient-only pages
│   │   ├── staff/         # Staff-only pages
│   │   └── settings/      # Shared settings
│   └── api/               # REST API route handlers
├── actions/               # Next.js Server Actions
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Navbar, Sidebar, Header
│   ├── appointments/      # Appointment-specific components
│   ├── doctors/           # Doctor card, form
│   ├── notifications/     # Bell dropdown
│   └── shared/            # PageHeader, EmptyState, etc.
├── lib/
│   ├── auth.ts            # Auth.js configuration
│   ├── prisma.ts          # Prisma client singleton
│   ├── prisma-enums.ts    # Enum definitions (pre-generate)
│   ├── prisma-types.ts    # Model types (pre-generate)
│   ├── utils/             # date, permissions, response helpers
│   └── validations/       # Zod schemas
├── types/                 # Global TypeScript types
└── middleware.ts          # Auth + role-based route protection
```

## Database Schema

```
User ─┬─ PatientProfile ── Appointment ──┬─ DoctorProfile
      └─ DoctorProfile ──┬─ Availability  └─ ConsultationNote
                         ├─ TimeOff
                         └─ Specialty

User ── Notification
```

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run db:push          # Push schema to DB (no migration file)
npm run db:migrate       # Create a migration file + apply
npm run db:generate      # Re-generate Prisma client after schema changes
npm run db:studio        # Open Prisma Studio (GUI for your data)
npm run db:seed          # Seed demo data via tsx
npm run db:reset         # Reset DB and re-migrate (destructive!)
```

> **Note:** `prisma` runs from `node_modules/.bin/prisma` — no global install needed.

## Key Business Rules

1. **Double booking prevention** — Unique constraint on `(doctorId, date, startTime)`
2. **Role scoping** — Patients only see their own data; doctors see their own appointments
3. **Availability** — Doctors define weekly slots; system generates bookable times
4. **Time-off** — Doctors can block date ranges; booking is prevented during time-off
5. **Notifications** — Automatic notifications on appointment creation & status changes

## After `prisma generate`

Once you run `npx prisma generate` against a real database, you can simplify imports. Replace:

```typescript
// Before (pre-generate workaround)
import type { Role } from "@/lib/prisma-enums"
import type { User } from "@/lib/prisma-types"

// After (generated types available)
import type { Role, User } from "@prisma/client"
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Vercel auto-detects Next.js

### Environment Variables for Production

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<32+ char random string>
AUTH_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

## License

MIT
