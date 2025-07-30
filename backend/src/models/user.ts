import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  username: string;
  domain: string;
  actorId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  inboxUrl: string;
  outboxUrl: string;
  followersUrl: string;
  followingUrl: string;
  isLocal: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  domain: {
    type: String,
    required: true
  },
  actorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String
  },
  inboxUrl: {
    type: String,
    required: true
  },
  outboxUrl: {
    type: String,
    required: true
  },
  followersUrl: {
    type: String,
    required: true
  },
  followingUrl: {
    type: String,
    required: true
  },
  isLocal: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);