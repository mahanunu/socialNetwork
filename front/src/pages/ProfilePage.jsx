import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() { // ← "export default" est essentiel
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/users/me');
        setUser(data.user);
      } catch (err) {
        setError('Non authentifié. Veuillez vous connecter.');
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, []);

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mon Profil</h1>
      <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio || 'Non renseignée'}</p>
    </div>
  );
}