import { Schema, model } from 'mongoose';
import crypto from 'node:crypto';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  bio: String,
  avatar: String,
  gender: String,
  addresses: [
    {
      type: { type: String },
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  ],
  session: {
    token: String,
    expiresAt: Date
  }
}, {
  timestamps: true 
});

userSchema.statics.generateSessionToken = function () {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
};
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author'
  });

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default model('User', userSchema);