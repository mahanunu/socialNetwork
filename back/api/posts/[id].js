import User from '../../models/User.js';
import Post from '../../models/Post.js';
import { connectDB } from '../../lib/db.js';
import { verifyAuth } from '../../lib/auth.js';
import { corsMiddleware } from '../../lib/cors.js';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const currentUser = await verifyAuth(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectDB();

    // Récupérer les informations de l'utilisateur
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer les posts de l'utilisateur
    const posts = await Post.find({ author: id })
      .populate('author', 'firstName lastName email')
      .populate('comments.author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(20);

    // Statistiques de l'utilisateur
    const postCount = await Post.countDocuments({ author: id });
    const totalLikes = await Post.aggregate([
      { $match: { author: user._id } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);

    const stats = {
      postCount,
      totalLikes: totalLikes[0]?.total || 0
    };

    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        createdAt: user.createdAt
      },
      posts,
      stats,
      isOwnProfile: currentUser._id.toString() === id
    });
  } catch (error) {
    console.error('Erreur consultation profil:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export default corsMiddleware(handler);