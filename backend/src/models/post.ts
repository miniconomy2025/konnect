import mongoose, { Schema, Document, Types } from 'mongoose';
import type { IUser } from './user.js';

export interface IPostBase {
  author: Types.ObjectId | IUser;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  activityId: string;
  likes: Types.ObjectId[];
  likesCount: number;
  isLiked?: boolean;
}

export interface IPost extends Document, IPostBase {
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostPopulated extends Omit<IPost, 'author'> {
  author: IUser;
}

const postSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  caption: {
    type: String,
    required: true,
    maxlength: 2200
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/webp']
  },
  activityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);