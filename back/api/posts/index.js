// back/api/posts/index.js
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import Post from '../../models/Post.js';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectToDatabase();

  if (req.method === 'POST') {
    const auth = await requireAuth(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Contenu requis' });
    }

    const post = await Post.create({
      author: auth.user._id,
      content: content.trim(),
    });

    return res.status(201).json({
      post: {
        id: post._id,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          id: auth.user._id,
          firstName: auth.user.firstName,
          lastName: auth.user.lastName,
        },
      },
    });
  }

  if (req.method === 'GET') {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName');
    return res.status(200).json({ posts });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
