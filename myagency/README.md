# MyAgency

The first-ever police leadership accountability platform. Anonymous reviews of department and sheriff's office leadership by officers, laterals, and recruits.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (username-based, anonymous-first)
- **Hosting:** Vercel (frontend), Render (backend)

## Project Structure

```
myagency/
├── client/       # React frontend (Vite)
├── server/       # Express backend
├── supabase/     # SQL schema and migrations
└── package.json  # Workspace root
```

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd myagency
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in the `server/` directory and fill in your Supabase credentials:

```bash
cp .env.example server/.env
```

### 3. Set up the database

Run the SQL in `supabase/schema.sql` in your Supabase SQL editor to create all tables and RLS policies.

### 4. Seed the database

```bash
npm run seed
```

### 5. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Deployment

- **Frontend:** Deploy `client/` to Vercel. Set `VITE_API_URL` to your Render backend URL.
- **Backend:** Deploy `server/` to Render. Set all environment variables from `.env.example`.

## Key Architecture Notes

- Grade computation is entirely isolated in `server/lib/gradeComputer.js` — swap the formula there without touching anything else.
- All auth is handled via Supabase Auth JWT tokens passed as Bearer tokens in the `Authorization` header.
- RLS policies on Supabase enforce data ownership at the database level.
- No officer real names, badge numbers, or department emails are collected or stored.
