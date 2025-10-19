import mongoose from 'mongoose';

const profileCommentSchema = new mongoose.Schema({
  profileOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
profileCommentSchema.index({ profileOwner: 1, createdAt: -1 });

export default mongoose.models.ProfileComment || mongoose.model('ProfileComment', profileCommentSchema);