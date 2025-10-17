import User from '../../models/User.js';
import Post from '../../models/Post.js';
import { connectDB } from '../../lib/db.js';
import { verifyAuth } from '../../lib/auth.js';
import { corsMiddleware } from '../../lib/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Connexion à la base de données
    await connectDB();

    // Nombre total d'utilisateurs
    const totalUsers = await User.countDocuments();

    // Répartition par genre
    const genderStats = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Nombre d'adresses renseignées
    const usersWithAddress = await User.countDocuments({
      $or: [
        { 'address.street': { $exists: true, $ne: '' } },
        { 'address.city': { $exists: true, $ne: '' } },
        { 'address.zipCode': { $exists: true, $ne: '' } },
        { 'address.country': { $exists: true, $ne: '' } }
      ]
    });

    // Répartition des utilisateurs par mois de création (derniers 12 mois)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Statistiques des posts
    let postStats = {
      totalPosts: 0,
      avgPostsPerUser: 0,
      usersWithPosts: 0
    };

    try {
      const totalPosts = await Post.countDocuments();
      const distinctAuthors = await Post.distinct('author');
      const usersWithPostsCount = distinctAuthors.length;
      const avgPostsPerUser = totalUsers > 0 ? (totalPosts / totalUsers) : 0;

      postStats = {
        totalPosts,
        avgPostsPerUser: parseFloat(avgPostsPerUser.toFixed(2)),
        usersWithPosts: usersWithPostsCount
      };
    } catch (postError) {
      console.error('Erreur lors de la récupération des stats de posts:', postError);
      // On continue avec des valeurs par défaut
    }

    // Top 5 utilisateurs les plus actifs
    let topUsers = [];
    try {
      topUsers = await User.aggregate([
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'posts'
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            postCount: { $size: '$posts' }
          }
        },
        {
          $sort: { postCount: -1 }
        },
        {
          $limit: 5
        }
      ]);
    } catch (topUsersError) {
      console.error('Erreur lors de la récupération des top users:', topUsersError);
      // On continue avec un tableau vide
    }

    const stats = {
      totalUsers,
      genderDistribution: genderStats,
      usersWithAddress,
      addressPercentage: totalUsers > 0 ? ((usersWithAddress / totalUsers) * 100).toFixed(2) : 0,
      usersByMonth,
      postStats,
      topUsers
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default corsMiddleware(handler);
