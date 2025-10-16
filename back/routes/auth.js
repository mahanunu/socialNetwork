// routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = Router();

// ✅ Route d'inscription
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, bio, avatar, gender, addresses } = req.body;

  // Validation basique
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Email, mot de passe, prénom et nom requis' });
  }

  // Validation email simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  // Validation mot de passe (au moins 6 caractères)
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit avoir au moins 6 caractères' });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // 🔑 Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      bio: bio || '',
      avatar: avatar || '',
      gender: gender || null,
      addresses: addresses || []
    });

    await user.save();

    // 🚫 Ne jamais renvoyer le hash
    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        gender: user.gender,
        addresses: user.addresses
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Route de login (inchangée)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const { token, expiresAt } = User.generateSessionToken();
    user.session = { token, expiresAt };
    await user.save();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    });

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔓 Logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    await User.updateOne({ 'session.token': token }, { $unset: { session: 1 } });
  }
  res.clearCookie('token');
  res.json({ message: 'Déconnecté' });
});

export default router;