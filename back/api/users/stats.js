import User from '../../models/User.js';
import Post from '../../models/Post.js';
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
  // Appliquer les headers CORS
  setCorsHeaders(res);

  // Gérer les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('📊 Stats endpoint appelé');
  console.log('Method:', req.method);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔐 Vérification auth...');
    const user = await requireAuth(req);
    if (!user) {
      console.log('❌ Auth failed');
      return res.status(401).json({ error: 'Non autorisé' });
    }
    console.log('✅ Auth OK, user:', user._id);

    console.log('🔌 Connexion DB...');
    await connectToDatabase();
    console.log('✅ DB connectée');

    console.log('📊 Comptage users...');
    const totalUsers = await User.countDocuments();
    console.log('✅ Total users:', totalUsers);

    const genderStats = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const usersWithAddress = await User.countDocuments({
      'address.city': { $exists: true, $ne: null }
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
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

    let totalPosts = 0;
    let usersWithPosts = 0;
    let avgPostsPerUser = 0;

    try {
      totalPosts = await Post.countDocuments();
      
      if (totalPosts > 0) {
        const distinctAuthors = await Post.distinct('author');
        usersWithPosts = distinctAuthors.length;
        avgPostsPerUser = totalUsers > 0 ? totalPosts / totalUsers : 0;
      }
    } catch (postError) {
      console.error('⚠️ Erreur posts:', postError);
    }

    let topUsers = [];
    try {
      topUsers = await Post.aggregate([
        {
          $group: {
            _id: '$author',
            postCount: { $sum: 1 }
          }
        },
        {
          $sort: { postCount: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $unwind: '$userInfo'
        },
        {
          $project: {
            _id: 1,
            postCount: 1,
            firstName: '$userInfo.firstName',
            lastName: '$userInfo.lastName',
            email: '$userInfo.email'
          }
        }
      ]);
    } catch (topError) {
      console.error('⚠️ Erreur top users:', topError);
    }

    const stats = {
      totalUsers,
      genderDistribution: genderStats,
      usersWithAddress,
      addressPercentage: totalUsers > 0 ? ((usersWithAddress / totalUsers) * 100).toFixed(2) : '0',
      usersByMonth,
      postStats: {
        totalPosts,
        avgPostsPerUser: parseFloat(avgPostsPerUser.toFixed(2)),
        usersWithPosts
      },
      topUsers
    };

    console.log('✅ Stats complètes générées');
    return res.status(200).json(stats);

  } catch (error) {
    console.error('❌ ERREUR FATALE:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}