
import ProfileComment from '../../models/ProfileComment.js';
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    const user = await requireAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectToDatabase();

    const comment = await ProfileComment.findById(id);
    if (!comment) {
      return res.status(404).json({ error: 'Commentaire non trouvé' });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (comment.author.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres commentaires' });
    }

    if (req.method === 'PUT') {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Le contenu est requis' });
      }

      if (content.length > 500) {
        return res.status(400).json({ error: 'Le commentaire ne peut pas dépasser 500 caractères' });
      }

      comment.content = content;
      await comment.save();

      const updatedComment = await ProfileComment.findById(comment._id)
        .populate('author', 'firstName lastName email');

      return res.status(200).json({
        ...updatedComment.toObject(),
        canEdit: true
      });
    }

    if (req.method === 'DELETE') {
      await comment.deleteOne();
      return res.status(200).json({ message: 'Commentaire supprimé' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Erreur modification commentaire:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}
