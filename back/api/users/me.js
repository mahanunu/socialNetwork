import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import User from '../../models/User.js';

export default async function handler(req, res) {
  const auth = await requireAuth(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  await connectToDatabase();

  if (req.method === 'GET') {
    const user = await User.findById(auth.user._id).select('-passwordHash -session');
    return res.status(200).json({ user });
  }

  if (req.method === 'PUT') {
    const { firstName, lastName, bio, avatar, gender } = req.body;
    const updated = await User.findByIdAndUpdate(
      auth.user._id,
      { firstName, lastName, bio, avatar, gender },
      { new: true }
    ).select('-passwordHash -session');
    return res.status(200).json({ user: updated });
  }

  res.status(405).json({ error: 'Méthode non autorisée' });
}