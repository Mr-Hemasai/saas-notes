-- Database Schema for Multi-Tenant SaaS Notes App
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(10) NOT NULL CHECK (plan IN ('free', 'pro'))
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'member')),
    tenant_id INTEGER REFERENCES tenants(id)
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id)
);

-- Pre-seed tenants
INSERT INTO tenants (slug, name, plan) VALUES
('acme', 'Acme', 'free'),
('globex', 'Globex', 'free');

-- Pre-seed users
INSERT INTO users (email, password, role, tenant_id) VALUES
('admin@acme.test', 'password', 'admin', (SELECT id FROM tenants WHERE slug='acme')),
('user@acme.test', 'password', 'member', (SELECT id FROM tenants WHERE slug='acme')),
('admin@globex.test', 'password', 'admin', (SELECT id FROM tenants WHERE slug='globex')),
('user@globex.test', 'password', 'member', (SELECT id FROM tenants WHERE slug='globex'));
