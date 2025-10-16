import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger le profil
  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/me');
      setUser(data.user);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Non authentifié. Veuillez vous connecter.');
    }
  };

  // Publier un post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setLoading(true);
      await api.post('/posts', { content: newPost });
      setNewPost('');
      await fetchProfile(); // 🔁 recharger les posts après publication
    } catch (err) {
      console.error('Erreur publication:', err);
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  if (!user) {
    return <div style={{ padding: '20px' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <h1>Mon Profil</h1>
      <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio || 'Non renseignée'}</p>

      <hr style={{ margin: '20px 0' }} />

      {/* 📝 Formulaire de création de post */}
      <h2>Créer un post</h2>
      <form onSubmit={handlePostSubmit} style={{ marginBottom: '20px' }}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Exprime-toi..."
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          rows="3"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      {/* 🧾 Liste des posts */}
      <h2>Mes Publications</h2>
      {posts.length === 0 ? (
        <p>Aucune publication pour le moment.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post) => (
            <li
              key={post._id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <p>{post.content}</p>
              <small>
                Posté le {new Date(post.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
