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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  await connectToDatabase();
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

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
  res.status(200).json({ user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
}