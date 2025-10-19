import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  // Charger le profil et les posts
  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/me');
      setUser(data.user);

      const allPosts = await api.get('/posts');
      const userPosts = allPosts.posts.filter(
        (post) => post.author._id === data.user._id
      );
      setPosts(userPosts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Publier un nouveau post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await api.post('/posts', { content: newPost });
      setNewPost('');
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un post
  const handleDeletePost = async (id) => {
    if (!window.confirm('Supprimer ce post ?')) return;

    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression du post');
    }
  };

  // Passer en mode édition
  const startEditing = (post) => {
    setEditingPost(post._id);
    setEditedContent(post.content);
  };

  // Annuler modification
  const cancelEditing = () => {
    setEditingPost(null);
    setEditedContent('');
  };

  // Sauvegarder les modifications
  const handleEditSubmit = async (id) => {
    if (!editedContent.trim()) return;
    try {
      await api.put(`/posts/${id}`, { content: editedContent });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, content: editedContent } : p
        )
      );
      cancelEditing();
    } catch (err) {
      alert('Erreur lors de la modification');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>Chargement...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <h1>Mon Profil</h1>
      <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Bio :</strong> {user.bio || 'Non renseignée'}</p>

      <hr />

      {/* Formulaire nouveau post */}
      <h2>Créer un post</h2>
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Exprime-toi..."
          style={{ width: '100%', padding: '10px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </form>

      <hr />

      {/* Liste des posts */}
      <h2>Mes Posts</h2>
      {posts.length === 0 ? (
        <p>Aucun post pour le moment.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '10px',
              background: '#f9f9f9',
              position: 'relative',
            }}
          >
            {editingPost === post._id ? (
              <>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                  rows="3"
                />
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => handleEditSubmit(post._id)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      marginRight: '5px',
                    }}
                  >
                    ✅ Sauvegarder
                  </button>
                  <button
                    onClick={cancelEditing}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                    }}
                  >
                    ❌ Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>{post.content}</p>
                <small>Posté le {new Date(post.createdAt).toLocaleString()}</small>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <button
                    onClick={() => startEditing(post)}
                    style={{
                      backgroundColor: '#ffc107',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 8px',
                      marginRight: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    style={{
                      backgroundColor: '#dc3545',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 8px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    🗑 Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}

      {/* Section commentaires */}
      <div className="comments-section">
        <h2>Commentaires sur le profil</h2>
        
        {/* Formulaire d'ajout */}
        <form onSubmit={handleAddComment} className="add-comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Laisser un commentaire sur ce profil..."
            rows="3"
            maxLength={500}
          />
          <div className="form-footer">
            <span className="char-count">{newComment.length}/500</span>
            <button type="submit" disabled={!newComment.trim()}>
              Publier
            </button>
          </div>
        </form>

        {/* Liste des commentaires */}
        <div className="comments-list">
          {profile.comments.length === 0 ? (
            <p className="no-comments">Aucun commentaire pour le moment</p>
          ) : (
            profile.comments.map(comment => (
              <div key={comment._id} className="comment">
                <div className="comment-author">
                  <strong>{comment.author.firstName} {comment.author.lastName}</strong>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {editingCommentId === comment._id ? (
                  <div className="edit-comment-form">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="3"
                      maxLength={500}
                    />
                    <div className="form-footer">
                      <span className="char-count">{editContent.length}/500</span>
                      <div className="button-group">
                        <button 
                          type="button"
                          onClick={() => handleEditComment(comment._id)}
                          disabled={!editContent.trim()}
                        >
                          Enregistrer
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditContent('');
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-content">
                      <p>{comment.content}</p>
                    </div>
                    {comment.canEdit && (
                      <div className="comment-actions">
                        <button 
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditContent(comment.content);
                          }}
                        >
                          ✏️ Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          className="delete-btn"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;