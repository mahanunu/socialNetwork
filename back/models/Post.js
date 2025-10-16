// models/Post.js
import { Schema, model } from 'mongoose';

const postSchema = new Schema({

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true 
});

export default model('Post', postSchema);