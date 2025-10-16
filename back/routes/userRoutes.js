import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

const router = Router();


router.put('/me', requireAuth, async (req, res) => {
  const { firstName, lastName, bio, avatar, gender, addresses } = req.body;
  const userId = req.user._id;

  try {
    // Mettre à jour uniquement les champs autorisés
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, bio, avatar, gender, addresses },
      { new: true, runValidators: true }
    ).select('-passwordHash -session'); // Ne jamais renvoyer le hash

    res.json({
      message: 'Profil mis à jour',
      user: updatedUser
    });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id/posts', async (req, res) => {
    try {
      const posts = await Post.find({ author: req.params.id })
        .sort({ createdAt: -1 }) // du plus récent au plus ancien
        .select('content createdAt');
  
      res.json({ posts });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

export default router;