import mongoose, { Document, Schema } from 'mongoose';
import { activityTypes, type ActivityType, type DisplayPersonActor } from '../types/inbox.ts';
import type { UriIdentifierWithOptionalReference } from '../types/shared.ts';

// TYPES/INTERFACES
export interface IActivityObject extends Document {
  type: ActivityType;
  summary?: string;
  actor: UriIdentifierWithOptionalReference;
  object: UriIdentifierWithOptionalReference;
  target?: string;
  origin?: string;
  activityId: string;
}

export interface IActivityObjectPopulated {
  type: ActivityType;
  summary?: string;
  actor: DisplayPersonActor | { actorId: string } | undefined;
  object: DisplayPersonActor | { actorId: string } | undefined;
  target?: string;
  origin?: string;
  activityId: string;
}

export interface IInboxActivity extends Document {
  inboxId: string;
  object: IActivityObject;
}

export interface IInboxActivityPopulated {
  inboxId: string;
  object: IActivityObjectPopulated;
}

// SCHEMAS
export const userIdOrRefSchema = new Schema<UriIdentifierWithOptionalReference>({
  id: { type: Schema.Types.String, required: true },
  ref: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

export const activityObjectSchema = new Schema<IActivityObject>({
  type: {
    type: Schema.Types.String,
    enum: activityTypes,
    required: true,
    index: true
  },
  summary: { type: Schema.Types.String },
  actor: {
    type: userIdOrRefSchema,
    required: true
  },
  object: {
    type: userIdOrRefSchema,
    required: true
  },
  target: { type: Schema.Types.String },
  origin: { type: Schema.Types.String },
  activityId: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    index: true
  }
}, { _id: false });

export const inboxSchema = new Schema<IInboxActivity>({
  inboxId: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  object: {
    type: activityObjectSchema,
    required: true
  }
}, { timestamps: true });

// Indexes
activityObjectSchema.index({ actor: 1 });
activityObjectSchema.index({ object: 1 });
inboxSchema.index({ inboxId: 1, object: 1 }, { unique: true });
inboxSchema.index({ createdAt: -1 });

export const InboxActivity = mongoose.model<IInboxActivity>(
  'InboxActivity',
  inboxSchema,
  'Inbox'
);
