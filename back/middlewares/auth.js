import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
   
    const user = await User.findOne({ 'session.token': token });
    
    if (!user || user.session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session expirée ou invalide' });
    }

    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};