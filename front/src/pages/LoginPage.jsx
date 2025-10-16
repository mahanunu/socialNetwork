// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
      } else {
        await api.post('/auth/signup', {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      }
      navigate('/profile'); // Redirige vers le profil après login/signup
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.error || 'Erreur inconnue');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              name="firstName"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <input
              name="lastName"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </>
        )}
        
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        
        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {isLogin ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
      
      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }}
      >
        {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
      </button>
    </div>
  );
}