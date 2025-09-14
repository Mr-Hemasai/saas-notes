import axios from 'axios';

export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: 'No token' });
  try {
    if (req.method === 'GET') {
      const result = await axios.get(`${backend}/notes`, { headers: { Authorization: authorization } });
      res.status(200).json(result.data);
    } else if (req.method === 'POST') {
      const result = await axios.post(`${backend}/notes`, req.body, { headers: { Authorization: authorization } });
      res.status(201).json(result.data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.error || 'Error' });
  }
}
