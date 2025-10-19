import User from '../../models/User.js';
import Post from '../../models/Post.js';
import ProfileComment from '../../models/ProfileComment.js';
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectToDatabase();

    const { id } = req.query;

    // Récupérer l'utilisateur
    const profileUser = await User.findById(id).select('-password');
    if (!profileUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer les posts de l'utilisateur
    const posts = await Post.find({ author: id })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Récupérer les commentaires sur le profil
    const comments = await ProfileComment.find({ profileOwner: id })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Statistiques de l'utilisateur
    const postCount = await Post.countDocuments({ author: id });
    const totalLikes = await Post.aggregate([
      { $match: { author: profileUser._id } },
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);

    return res.status(200).json({
      user: profileUser,
      posts,
      comments: comments.map(comment => ({
        ...comment.toObject(),
        canEdit: comment.author._id.toString() === user._id.toString()
      })),
      stats: {
        postCount,
        totalLikes: totalLikes[0]?.total || 0,
        commentCount: comments.length
      },
      isOwnProfile: profileUser._id.toString() === user._id.toString()
    });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}