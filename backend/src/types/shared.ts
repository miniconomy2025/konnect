import type mongoose from "mongoose";

export interface UriIdentifierWithOptionalReference { id: string; ref?: mongoose.Types.ObjectId }
