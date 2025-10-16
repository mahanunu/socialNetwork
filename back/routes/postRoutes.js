// routes/postRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import Post from '../models/Post.js';

const router = Router();


router.post('/', requireAuth, async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Le contenu du post est requis' });
  }

  if (content.length > 1000) {
    return res.status(400).json({ error: 'Le post ne doit pas dépasser 1000 caractères' });
  }

  try {
    const post = new Post({
      author: req.user._id, 
      content: content.trim()
    });

    await post.save();

    res.status(201).json({
      message: 'Post créé',
      post: {
        id: post._id,
        content: post.content,
        author: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        },
        createdAt: post.createdAt
      }
    });

  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;