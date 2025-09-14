# SaaS Notes Application

## Project Objective
A multi-tenant SaaS Notes application supporting multiple organizations (tenants) with isolated data by tenant, subscription plans, and role-based access.

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
- `POST /tenants/:slug/upgrade` — Upgrade subscription (admin only)

## Deployment Links
- **Backend**: [Vercel/Netlify URL here]
- **Frontend**: [Vercel/Netlify URL here]

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

---

**For production, deploy both backend and frontend to Vercel or Netlify.**
