import axios from 'axios';

export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  if (req.method === 'POST') {
    try {
      const result = await axios.post(`${backend}/auth/login`, req.body);
      res.status(200).json(result.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({ error: err.response?.data?.error || 'Login failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
