import { setCorsHeaders } from '../../lib/cors.js';
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import User from '../../models/User.js';
import Post from '../../models/Post.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ✅ Authentification
    const auth = await requireAuth(req);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.error });
    }

    await connectToDatabase();

    // ✅ GET → profil + posts
    if (req.method === 'GET') {
      const user = await User.findById(auth.user._id).select('-passwordHash -session');
      if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

      // 🔥 Récupère tous les posts de cet utilisateur
      const posts = await Post.find({ author: auth.user._id })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ user, posts });
    }

    // ✅ PUT → mise à jour du profil
    if (req.method === 'PUT') {
      const { firstName, lastName, bio, avatar, gender, addresses } = req.body;

      const updated = await User.findByIdAndUpdate(
        auth.user._id,
        { firstName, lastName, bio, avatar, gender, addresses },
        { new: true }
      ).select('-passwordHash -session');

      return res.status(200).json({ user: updated });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error('User /me error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
