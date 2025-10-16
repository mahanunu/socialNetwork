// back/lib/auth.js
import { connectToDatabase } from './db.js';
import User from '../models/User.js';
import { parse } from 'cookie';

export async function requireAuth(req) {
  await connectToDatabase();

  // ✅ Lire le cookie de manière fiable
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return { error: 'Non authentifié (token manquant)', status: 401 };
  }

  // ✅ Rechercher l'utilisateur avec ce token
  const user = await User.findOne({ 'session.token': token });
  if (!user) {
    return { error: 'Session invalide', status: 401 };
  }

  // ✅ Vérifier si la session est expirée
  if (user.session.expiresAt && new Date(user.session.expiresAt) < new Date()) {
    return { error: 'Session expirée', status: 401 };
  }

  return { user };
}
