import { connectToDatabase } from '../../lib/db.js';
import User from '../../models/User.js';
import { serialize } from 'cookie';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  await connectToDatabase();
  
  const cookies = req.headers.cookie?.split(';').map(c => c.trim()) || [];
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : null;

  if (token) {
    await User.updateOne({ 'session.token': token }, { $unset: { session: 1 } });
  }

  const clearedCookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });

  res.setHeader('Set-Cookie', clearedCookie);
  res.status(200).json({ message: 'Déconnecté' });
}