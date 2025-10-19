
import ProfileComment from '../../models/ProfileComment.js';
import { requireAuth } from '../../lib/auth.js';
import { connectToDatabase } from '../../lib/db.js';
import { setCorsHeaders } from '../../lib/cors.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    await connectToDatabase();

    const { profileOwner, content } = req.body;

    if (!profileOwner || !content) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas dépasser 500 caractères' });
    }

    const comment = await ProfileComment.create({
      profileOwner,
      author: user._id,
      content
    });

    const populatedComment = await ProfileComment.findById(comment._id)
      .populate('author', 'firstName lastName email');

    return res.status(201).json({
      ...populatedComment.toObject(),
      canEdit: true
    });

  } catch (error) {
    console.error('Erreur création commentaire:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
}
