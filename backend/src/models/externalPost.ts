import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExternalPost extends Document {
  activityId: string;
  actorId: string;
  objectId: string;
  content: string;
  contentText: string;
  summary?: string;
  published: Date;
  updated?: Date;
  url?: string;
  inReplyTo?: string;
  
  attachments: Array<{
    type: 'image' | 'video' | 'audio' | 'document' | 'unknown';
    url: string;
    mediaType?: string;
    width?: number;
    height?: number;
    description?: string;
  }>;
  
  mentions: Array<{
    name: string;
    href: string;
  }>;
  
  tags: Array<{
    type: 'Hashtag' | 'Mention' | 'Emoji';
    name: string;
    href?: string;
  }>;
  
  to: string[];
  cc?: string[];
  
  likesCount?: number;
  sharesCount?: number;
  repliesCount?: number;
  
  platformType?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'unknown'],
    required: true
  },
  url: { type: String, required: true },
  mediaType: String,
  width: Number,
  height: Number,
  description: String
}, { _id: false });

const mentionSchema = new Schema({
  name: { type: String, required: true },
  href: { type: String, required: true }
}, { _id: false });

const tagSchema = new Schema({
  type: {
    type: String,
    enum: ['Hashtag', 'Mention', 'Emoji'],
    required: true
  },
  name: { type: String, required: true },
  href: String
}, { _id: false });

const externalPostSchema = new Schema<IExternalPost>({
  activityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  actorId: {
    type: String,
    required: true,
    index: true
  },
  objectId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  contentText: {
    type: String,
    required: true
  },
  summary: String,
  published: {
    type: Date,
    required: true,
    index: true
  },
  updated: Date,
  url: String,
  inReplyTo: String,
  
  attachments: [attachmentSchema],
  mentions: [mentionSchema],
  tags: [tagSchema],
  
  to: [{ type: String, required: true }],
  cc: [String],
  
  likesCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  
  platformType: String
}, {
  timestamps: true
});

externalPostSchema.index({ actorId: 1, published: -1 });
externalPostSchema.index({ published: -1 });
externalPostSchema.index({ 'to': 1 });

export const ExternalPost = mongoose.model<IExternalPost>('ExternalPost', externalPostSchema);