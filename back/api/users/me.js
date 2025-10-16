import { setCorsHeaders } from '../../lib/cors.js';
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import User from '../../models/User.js';

export default async function handler(req, res) {
  // ✅ 1. Toujours appliquer CORS en premier
  setCorsHeaders(req, res);

  // ✅ 2. Réponse immédiate pour les requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(200).end();
  }

  try {
    // ✅ 3. Authentification
    const auth = await requireAuth(req);
    if (auth.error) {
      setCorsHeaders(req, res);
      return res.status(auth.status).json({ error: auth.error });
    }

    // ✅ 4. Connexion à la base
    await connectToDatabase();

    // ✅ 5. Méthode GET → Récupérer les infos utilisateur
    if (req.method === 'GET') {
      const user = await User.findById(auth.user._id).select('-passwordHash -session');
      setCorsHeaders(req, res);
      return res.status(200).json({ user });
    }

    // ✅ 6. Méthode PUT → Mettre à jour le profil utilisateur
    if (req.method === 'PUT') {
      const { firstName, lastName, bio, avatar, gender, addresses } = req.body;

      const updated = await User.findByIdAndUpdate(
        auth.user._id,
        { firstName, lastName, bio, avatar, gender, addresses },
        { new: true }
      ).select('-passwordHash -session');

      setCorsHeaders(req, res);
      return res.status(200).json({ user: updated });
    }

    // ✅ 7. Méthode non autorisée
    setCorsHeaders(req, res);
    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (err) {
    console.error('User /me error:', err);
    setCorsHeaders(req, res);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
