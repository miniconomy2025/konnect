import type { UriIdentifierWithOptionalReference } from "./shared.ts";

export interface CreateFollow {
  actor: UriIdentifierWithOptionalReference;
  object: UriIdentifierWithOptionalReference;
  activity: UriIdentifierWithOptionalReference;
}