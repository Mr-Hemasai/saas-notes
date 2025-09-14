import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// JWT Auth endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const userQuery = await pool.query(
      `SELECT users.id, users.email, users.password, users.role, users.tenant_id, tenants.slug, tenants.plan FROM users JOIN tenants ON users.tenant_id = tenants.id WHERE users.email = $1`,
      [email]
    );
    if (userQuery.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = userQuery.rows[0];
    if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role, tenantSlug: user.slug, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ...previous code...

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// List notes for tenant
app.get('/notes', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const notes = await pool.query('SELECT * FROM notes WHERE tenant_id = $1', [tenantId]);
    res.json(notes.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note (tenant isolation)
app.get('/notes/:id', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const note = await pool.query('SELECT * FROM notes WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
    if (note.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json(note.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create note (enforce free plan limit)
app.post('/notes', authenticateJWT, async (req, res) => {
  try {
    const { tenantId, userId, plan } = req.user;
    if (!req.body.title) return res.status(400).json({ error: 'Title required' });
    if (plan === 'free') {
      const noteCount = await pool.query('SELECT COUNT(*) FROM notes WHERE tenant_id = $1', [tenantId]);
      if (parseInt(noteCount.rows[0].count) >= 3) {
        return res.status(403).json({ error: 'Free plan limit reached' });
      }
    }
    const result = await pool.query(
      'INSERT INTO notes (title, content, tenant_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.body.title, req.body.content || '', tenantId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
app.put('/notes/:id', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.user;
    // Only update if note belongs to tenant
    const note = await pool.query('SELECT * FROM notes WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
    if (note.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    const updated = await pool.query(
      'UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [req.body.title || note.rows[0].title, req.body.content || note.rows[0].content, req.params.id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
app.delete('/notes/:id', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const note = await pool.query('SELECT * FROM notes WHERE id = $1 AND tenant_id = $2', [req.params.id, tenantId]);
    if (note.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ...rest of code...

// ...previous code...

// Subscription Upgrade (Admin only)
app.post('/tenants/:slug/upgrade', authenticateJWT, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') return res.status(403).json({ error: 'Only admin can upgrade' });
    const { slug } = req.params;
    const result = await pool.query('UPDATE tenants SET plan = $1 WHERE slug = $2 RETURNING *', ['pro', slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tenant not found' });
    res.json({ success: true, tenant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ...previous code...

// List all users for tenant (for note details)
app.get('/users', authenticateJWT, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const users = await pool.query('SELECT id, email, role, tenant_id FROM users WHERE tenant_id = $1', [tenantId]);
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
