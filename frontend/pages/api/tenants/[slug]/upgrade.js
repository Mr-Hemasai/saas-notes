import axios from 'axios';

export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const { authorization } = req.headers;
  const { slug } = req.query;
  if (!authorization) return res.status(401).json({ error: 'No token' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = await axios.post(`${backend}/tenants/${slug}/upgrade`, {}, { headers: { Authorization: authorization } });
    res.status(200).json(result.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.error || 'Upgrade failed' });
  }
}
