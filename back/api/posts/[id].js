// back/api/posts/[id].js
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
  if (!post) {
    return res.status(404).json({ error: 'Post non trouvé' });
  }

  // Auth obligatoire pour modification/suppression
  const auth = await requireAuth(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  if (post.author.toString() !== auth.user._id.toString()) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  // ✏️ Modifier un post
  if (req.method === 'PUT') {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Le contenu ne peut pas être vide' });
    }
    post.content = content.trim();
    post.updatedAt = new Date();
    await post.save();
    return res.status(200).json({ message: 'Post modifié', post });
  }

  // 🗑️ Supprimer un post
  if (req.method === 'DELETE') {
    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Post supprimé' });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
