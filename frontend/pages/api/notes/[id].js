import axios from 'axios';

export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  const { authorization } = req.headers;
  const { id } = req.query;
  if (!authorization) return res.status(401).json({ error: 'No token' });
  try {
    if (req.method === 'DELETE') {
      await axios.delete(`${backend}/notes/${id}`, { headers: { Authorization: authorization } });
      res.status(200).json({ success: true });
    } else if (req.method === 'PUT') {
      const result = await axios.put(`${backend}/notes/${id}`, req.body, { headers: { Authorization: authorization } });
      res.status(200).json(result.data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data?.error || 'Error' });
  }
}
