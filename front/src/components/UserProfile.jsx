
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import CommentSection from './CommentSection';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get(`/users/${id}`);
        setProfile(data);
      } catch (err) {
        setError(err.error || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const data = await api.get(`/users/${id}`);
      setProfile(data);
    } catch (err) {
      setError(err.error || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Chargement du profil...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="user-profile-container">
      {/* En-tête du profil */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.user.firstName[0]}{profile.user.lastName[0]}
        </div>
        <div className="profile-info">
          <h1>{profile.user.firstName} {profile.user.lastName}</h1>
          <p className="profile-email">{profile.user.email}</p>
          {profile.user.gender && (
            <p className="profile-gender">Genre: {profile.user.gender}</p>
          )}
          {profile.user.address && (
            <p className="profile-address">
              📍 {profile.user.address.city}, {profile.user.address.country}
            </p>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-value">{profile.stats.postCount}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.stats.totalLikes}</span>
          <span className="stat-label">Likes reçus</span>
        </div>
      </div>

      {/* Posts de l'utilisateur */}
      <div className="profile-posts">
        <h2>Publications</h2>
        {profile.posts.length === 0 ? (
          <p className="no-posts">Aucune publication pour le moment</p>
        ) : (
          profile.posts.map(post => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <span className="post-author">
                  {post.author.firstName} {post.author.lastName}
                </span>
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="post-content">{post.content}</p>
              <div className="post-stats">
                <span>❤️ {post.likes?.length || 0} likes</span>
                <span>💬 {post.comments?.length || 0} commentaires</span>
              </div>
              <CommentSection 
                postId={post._id} 
                comments={post.comments || []}
                onCommentAdded={fetchProfile}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;
