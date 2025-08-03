import { createFederation, InProcessMessageQueue, MemoryKvStore } from "@fedify/fedify";
import { createActorDispatcher } from "./dispatchers/actor.ts";
import { createOutboxDispatcher } from "./dispatchers/outbox.ts";
import { createFollowersDispatcher, createFollowingDispatcher } from "./dispatchers/social.ts";
import { createInboxDispatcher } from "./dispatchers/inbox.ts";
import { createObjectDispatchers } from "./dispatchers/objects.ts";
import { addFollowListener } from "./listeners/follow.ts";
import { addCreateListener } from "./listeners/create.ts";

const federation = createFederation({
  kv: new MemoryKvStore(),
  queue: new InProcessMessageQueue(),
});

createActorDispatcher(federation);
createOutboxDispatcher(federation);
createFollowersDispatcher(federation);
createFollowingDispatcher(federation);
createInboxDispatcher(federation);
createObjectDispatchers(federation);

const inboxListeners = federation.setInboxListeners("/users/{identifier}/inbox", "/inbox");

addFollowListener(inboxListeners);
addCreateListener(inboxListeners);

export default federation;