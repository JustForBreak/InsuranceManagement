# Insurance Management System

A simple full-stack insurance management application built with Next.js, PostgreSQL, and deployed on Railway.

## Features

- User authentication with registration and login
- Database connectivity with PostgreSQL
- Simple, clean UI using Shadcn components
- Next.js API routes for backend logic

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Deployment**: Railway

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/           # API routes (login, register)
│   │   ├── register/      # Registration page
│   │   └── page.tsx       # Login page
│   └── components/ui/     # Shadcn components
├── schema.sql             # Database schema
└── railway.json           # Railway deployment config
```

## Development Setup

### Prerequisites

- Node.js 20.9.0+ (required for Next.js 16)
- PostgreSQL (local or Railway)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up database:
   - Create a PostgreSQL database
   - Run the schema: `psql -d your_database < schema.sql`

3. Configure environment variables (create `.env.local`):
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Spikes Completed

### Spike 1: Database Connectivity and Schema Setup ✅

- Created PostgreSQL schema with `users` and `policies` tables
- Built Node.js script (`db-test.js`) demonstrating CRUD operations
- Verified database connection and basic operations

### Spike 2: Authentication Prototype ✅

- Created Express `/login` endpoint with static credential validation
- Built React login form with success/fail message display
- Confirmed API communication between frontend and backend

## Deployment to Railway

### Node.js Configuration

The app is configured to use Node.js 20+ (required for Next.js 16) via `nixpacks.toml` and `.nvmrc` files.

### Database Setup

1. Create a new PostgreSQL database on Railway
2. Run the schema in Railway's database console:
```sql
-- Copy contents of schema.sql
```

### Frontend Deployment

1. Connect your GitHub repository to Railway
2. Deploy the Next.js application
3. Set environment variables in Railway dashboard

### Backend Deployment

1. Create a separate Railway service for the backend
2. Deploy from the `backend/` directory
3. Update frontend API calls to use the deployed backend URL

### Environment Variables (Railway)

```
DB_HOST=containers-us-west-*.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-railway-password
NODE_ENV=production
```

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `first_name`, `last_name` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### Policies Table
- `id` (SERIAL PRIMARY KEY)
- `policy_number` (VARCHAR UNIQUE)
- `user_id` (INTEGER, REFERENCES users)
- `type`, `status` (VARCHAR)
- `coverage_amount`, `premium` (DECIMAL)
- `start_date`, `end_date` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `node db-test.js` - Test database operations
- `cd backend && npm start` - Start backend API
