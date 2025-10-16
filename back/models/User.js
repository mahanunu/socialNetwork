import { Schema, model } from 'mongoose';
import crypto from 'node:crypto';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: String,
  lastName: String,
  bio: String,
  avatar: String,
  gender: String,
  session: { token: String, expiresAt: Date }
}, { timestamps: true });

userSchema.statics.generateSessionToken = function () {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
};

export default model('User', userSchema);