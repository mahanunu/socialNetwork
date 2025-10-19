import Post from '../../../models/Post.js';
import { connectToDatabase } from '../../../lib/db.js';
import { requireAuth } from '../../../lib/auth.js';
import { setCorsHeaders } from '../../../lib/cors.js';

async function handler(req, res) {
  const { id } = req.query;

  try {
    const user = await requireAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectToDatabase();

    if (req.method === 'POST') {
      // Ajouter un commentaire
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Le contenu du commentaire est requis' });
      }

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post non trouvé' });
      }

      const newComment = {
        author: user._id,
        content: content.trim()
      };

      post.comments.push(newComment);
      await post.save();

      // Peupler les informations de l'auteur du commentaire
      await post.populate('comments.author', 'firstName lastName email');

      return res.status(201).json({
        message: 'Commentaire ajouté',
        comment: post.comments[post.comments.length - 1]
      });
    }

    if (req.method === 'GET') {
      // Récupérer tous les commentaires d'un post
      const post = await Post.findById(id)
        .populate('comments.author', 'firstName lastName email');

      if (!post) {
        return res.status(404).json({ error: 'Post non trouvé' });
      }

      return res.status(200).json({ comments: post.comments });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Erreur commentaires:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export default setCorsHeaders(handler);
