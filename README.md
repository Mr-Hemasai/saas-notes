# SaaS Notes Application

## Project Objective
A multi-tenant SaaS Notes application supporting multiple organizations (tenants) with isolated data, subscription plans, and role-based access. Now with a beautiful, modern UI and advanced note features.

## Features
- Multi-tenancy: Shared schema with `tenant_id`, strict tenant isolation.
- JWT authentication (admin/member roles).
- **Notes CRUD**: Create, edit, delete, pin, and view notes. All actions are tenant-isolated.
- **Pin notes**: Pin important notes to the top (local, per session).
- **Edit notes**: Update note title/content directly from dashboard.
- **View notes**: Click the 👁️ View button to see full note details in a modal, including who added the note.
- **Who added the note**: View modal shows the email of the user who created the note.
- **Subscription plan enforcement**: Free plan (max 3 notes/tenant), Pro plan (unlimited). Upgrade instantly.
- **Modern UI**: Glassmorphism, gradients, responsive design, micro-interactions, and accessibility.
- **Beautiful modals** for creating, editing, and viewing notes.
- **Frontend/Backend**: Next.js (frontend), Node.js + Express (backend), PostgreSQL (Supabase-ready).
- **Deployed to Vercel/Netlify** (instructions below).

## Multi-Tenancy Approach
- Shared PostgreSQL schema: all tables (users, notes) have a `tenant_id` column.
- All API access is tenant-isolated using the `tenant_id` from the JWT.

## Database Schema
- **tenants**: id, slug, name, plan (free/pro)
- **users**: id, email, password (plaintext for demo), role (admin/member), tenant_id
- **notes**: id, title, content, tenant_id, user_id

### Pre-seeded Tenants
- Acme (free)
- Globex (free)

### Pre-seeded Users
| Email              | Password | Role   | Tenant  |
|--------------------|----------|--------|---------|
| admin@acme.test    | password | admin  | Acme    |
| user@acme.test     | password | member | Acme    |
| admin@globex.test  | password | admin  | Globex  |
| user@globex.test   | password | member | Globex  |

## API Endpoints
- `GET /health` — Health check
- `POST /auth/login` — Login, returns JWT ({ userId, tenantId, role, tenantSlug, plan })
- `GET /notes` — List notes (tenant-isolated)
- `POST /notes` — Create note (enforces Free plan limit = 3)
- `GET /notes/:id` — Get note (tenant-isolated)
- `PUT /notes/:id` — Update note (tenant-isolated)
- `DELETE /notes/:id` — Delete note (tenant-isolated)
- `GET /users` — List users for tenant (for note details in view modal)
- `POST /tenants/:slug/upgrade` — Upgrade subscription (admin only)

### Example: Upgrade to Pro (curl)
```sh
curl -X POST \
  -H "Authorization: Bearer <JWT>" \
  http://localhost:4000/tenants/acme/upgrade
```

## Frontend Features
- **Login page**: Enter email + password, call `/auth/login`, store JWT.
- **Dashboard**:
  - List, create, delete, edit, pin, and view notes.
  - View modal for note details and author.
  - Shows “Upgrade to Pro” when Free plan limit is reached (admin only).
  - Only Admins see the upgrade button.
  - Members see info message at note limit.
  - JWT is stored and included in API requests.
- **Modern, responsive design**: Glassmorphism, gradients, icons, and smooth interactions.

## Test Accounts
- **Acme:**
  - admin@acme.test / password (admin)
  - user@acme.test / password (member)
- **Globex:**
  - admin@globex.test / password (admin)
  - user@globex.test / password (member)

## Local Development
1. Start PostgreSQL and run `backend/schema.sql` to seed the DB.
2. In `/backend`, add your DB URL to `.env` and run `npm install && npm run dev`.
3. In `/frontend`, set `NEXT_PUBLIC_BACKEND_URL` in `.env.local`, run `npm install && npm run dev`.

## Deployment
- Deploy backend and frontend to Vercel or Netlify (see `netlify.toml`).
- Update the URLs below after deployment:
  - **Backend**: [Vercel/Netlify URL here]
  - **Frontend**: [Vercel/Netlify URL here]

---

**All features are implemented and documented. For questions or improvements, open an issue or PR!**
