import Post from '../../../../models/Post.js';
import { connectToDatabase } from '../../../../lib/db.js';
import { requireAuth } from '../../../../lib/auth.js';
import { setCorsHeaders } from '../../../../lib/cors.js';

async function handler(req, res) {
  const { id, commentId } = req.query;

  try {
    const user = await requireAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectToDatabase();

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur du commentaire
    if (comment.author.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres commentaires' });
    }

    if (req.method === 'PUT') {
      // Éditer le commentaire
      const { content } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Le contenu du commentaire est requis' });
      }

      comment.content = content.trim();
      await post.save();

      await post.populate('comments.author', 'firstName lastName email');

      return res.status(200).json({
        message: 'Commentaire modifié',
        comment
      });
    }

    if (req.method === 'DELETE') {
      // Supprimer le commentaire
      comment.deleteOne();
      await post.save();

      return res.status(200).json({ message: 'Commentaire supprimé' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Erreur modification commentaire:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

export default setCorsHeaders(handler);