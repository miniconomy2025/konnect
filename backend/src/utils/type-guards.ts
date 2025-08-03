import type { DisplayPersonActor } from "../types/inbox.ts";

export const isDisplayPersonActor = (actor: any | undefined): actor is DisplayPersonActor => !!actor && "actorId" in actor && "username" in actor && "displayName" in actor && "avatarUrl" in actor;