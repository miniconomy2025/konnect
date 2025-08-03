import mongoose, { Document, Schema } from 'mongoose';
import { type DisplayPersonActor } from '../types/inbox.ts';
import type { UriIdentifierWithOptionalReference } from '../types/shared.ts';
import type { IInboxActivityPopulated } from './inbox.ts';

// TYPES/INTERFACES
export interface IFollowObject extends Document {
  actor: UriIdentifierWithOptionalReference;
  object: UriIdentifierWithOptionalReference;
  activity: UriIdentifierWithOptionalReference;
}

export interface IFollowObjectPopulated {
  actor: DisplayPersonActor | { actorId: string } | undefined;
  object: DisplayPersonActor | { actorId: string } | undefined;
  activity: IInboxActivityPopulated | undefined;
}

// SCHEMAS
export const userIdOrRefSchema = new Schema<UriIdentifierWithOptionalReference>({
  id: { type: Schema.Types.String, required: true },
  ref: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

export const activityIdOrRefSchema = new Schema<UriIdentifierWithOptionalReference>({
  id: { type: Schema.Types.String, required: true },
  ref: { type: Schema.Types.ObjectId, ref: 'InboxActivity' }
}, { _id: false });

export const followObjectSchema = new Schema<IFollowObject>({
  actor: {
    type: userIdOrRefSchema,
    required: true,
  },
  object: {
    type: userIdOrRefSchema,
    required: true
  },
  activity: {
    type: activityIdOrRefSchema,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
followObjectSchema.index({ actor: 1 });
followObjectSchema.index({ object: 1 });
followObjectSchema.index({ activity: 1 });
followObjectSchema.index({ actor: 1, object: 1, activity: 1 }, { unique: true });

export const FollowModel = mongoose.model<IFollowObject>(
  'Follow',
  followObjectSchema,
  'follows'
);
