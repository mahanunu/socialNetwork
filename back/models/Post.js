import { Schema, model } from 'mongoose';

const postSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

export default model('Post', postSchema);