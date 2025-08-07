import mongoose, { Document, Schema } from 'mongoose';
import type { UriIdentifierWithOptionalReference } from '../types/shared.ts';

export interface ILike extends Document {
  actor: UriIdentifierWithOptionalReference; 
  object: UriIdentifierWithOptionalReference; 
  activityId: string;
  isLocal: boolean; 
  createdAt: Date;
}

const likeSchema = new Schema<ILike>({
  actor: {
    id: { type: String, required: true },
    ref: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  object: {
    id: { type: String, required: true },
    ref: { type: Schema.Types.ObjectId, ref: 'Post' }
  },
  activityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isLocal: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

likeSchema.index({ 'object.id': 1 });
likeSchema.index({ 'actor.id': 1 });
likeSchema.index({ 'object.id': 1, 'actor.id': 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);