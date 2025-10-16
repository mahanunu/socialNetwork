import { connectToDatabase } from '../../lib/db.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  await connectToDatabase();
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, firstName, lastName, bio: '', avatar: '' });

  const { token, expiresAt } = User.generateSessionToken();
  user.session = { token, expiresAt };
  await user.save();

  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(201).json({ user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
}