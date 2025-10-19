import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/users/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Erreur lors de la récupération du profil');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/profile-comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileOwner: id,
          content: newComment
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du commentaire');
      }

      const comment = await response.json();
      setProfile(prev => ({
        ...prev,
        comments: [comment, ...prev.comments],
        stats: {
          ...prev.stats,
          commentCount: prev.stats.commentCount + 1
        }
      }));
      setNewComment('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/profile-comments/${commentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du commentaire');
      }

      const updatedComment = await response.json();
      setProfile(prev => ({
        ...prev,
        comments: prev.comments.map(comment =>
          comment._id === commentId ? updatedComment : comment
        )
      }));
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/profile-comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du commentaire');
      }

      setProfile(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId),
        stats: {
          ...prev.stats,
          commentCount: prev.stats.commentCount - 1
        }
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!profile) return <div className="not-found">Profil non trouvé</div>;

  return (
    <div className="profile-page">
      {/* En-tête du profil */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.user.firstName?.[0]}{profile.user.lastName?.[0]}
        </div>
        <h1>{profile.user.firstName} {profile.user.lastName}</h1>
        <p className="profile-email">{profile.user.email}</p>
        {profile.isOwnProfile && <span className="own-profile-badge">Votre profil</span>}
      </div>

      {/* Statistiques */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{profile.stats.postCount}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{profile.stats.totalLikes}</span>
          <span className="stat-label">Likes reçus</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{profile.stats.commentCount}</span>
          <span className="stat-label">Commentaires</span>
        </div>
      </div>

      {/* Posts récents */}
      {profile.posts.length > 0 && (
        <div className="posts-section">
          <h2>Posts récents</h2>
          <div className="posts-list">
            {profile.posts.map(post => (
              <div key={post._id} className="post-item">
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <div className="post-meta">
                  <span>❤️ {post.likes?.length || 0} likes</span>
                  <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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