import { useState } from 'react';
import api from '../services/api';
import './CommentSection.css';

const CommentSection = ({ postId, comments, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
  
    setLoading(true);
    try {
      await api.post(`/posts/${postId}/comments`, { content: newComment });
      setNewComment('');
      onCommentAdded();
    } catch (error) {
      alert(error.error || 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (id, content) => {
    if (!content.trim()) return;
    
    try {
      await api.put(`/comments/${id}`, { content });
      setEditingId(null);
      setEditContent('');
      onCommentAdded();
    } catch (error) {
      alert(error.error || 'Erreur lors de la modification du commentaire');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;
    
    try {
      await api.delete(`/comments/${id}`);
      onCommentAdded();
    } catch (error) {
      alert(error.error || 'Erreur lors de la suppression du commentaire');
    }
  };

  return (
    <div className="comment-section">
      <h3>Commentaires ({comments.length})</h3>
      
      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newComment.trim()}>
          {loading ? 'Envoi...' : 'Commenter'}
        </button>
      </form>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-content">
              {editingId === comment.id ? (
                <div className="edit-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    defaultValue={comment.content}
                  />
                  <div className="edit-actions">
                    <button 
                      onClick={() => handleEditComment(comment.id, editContent)}
                      className="save-btn"
                    >
                      Enregistrer
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="cancel-btn"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{comment.content}</p>
                  <div className="comment-actions">
                    {comment.canEdit && (
                      <button 
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="edit-btn"
                      >
                        Modifier
                      </button>
                    )}
                    {comment.canDelete && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="delete-btn"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;