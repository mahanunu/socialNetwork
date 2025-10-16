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
  const { id } = req.query;

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ error: 'Post non trouvé' });

  if (req.method === 'PUT' || req.method === 'DELETE') {
    const auth = await requireAuth(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    if (post.author.toString() !== auth.user._id.toString()) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (req.method === 'PUT') {
      const { content } = req.body;
      post.content = content.trim();
      await post.save();
      return res.status(200).json({ post: { id: post._id, content: post.content } });
    }

    if (req.method === 'DELETE') {
      await Post.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Post supprimé' });
    }
  }

  if (req.method === 'GET') {
    await post.populate('author', 'firstName lastName');
    return res.status(200).json({ post });
  }

  res.status(405).json({ error: 'Méthode non autorisée' });
}