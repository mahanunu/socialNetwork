import { connectToDatabase } from './db.js';
import User from '../models/User.js';

export async function requireAuth(req) {
  await connectToDatabase();
  
  // Extraire le token du cookie
  const cookies = req.headers.cookie?.split(';').map(c => c.trim()) || [];
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  const token = tokenCookie ? tokenCookie.split('=')[1] : null;

  if (!token) return { error: 'Non authentifié', status: 401 };

  const user = await User.findOne({ 'session.token': token });
  if (!user || user.session.expiresAt < new Date()) {
    return { error: 'Session expirée', status: 401 };
  }

  return { user };
}