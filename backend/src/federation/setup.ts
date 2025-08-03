import { createFederation, InProcessMessageQueue, MemoryKvStore } from "@fedify/fedify";
import { createActorDispatcher } from "./dispatchers/actor.ts";
import { createOutboxDispatcher } from "./dispatchers/outbox.ts";
import { createFollowersDispatcher, createFollowingDispatcher } from "./dispatchers/social.ts";
import { createInboxDispatcher } from "./dispatchers/inbox.ts";
import { createObjectDispatchers } from "./dispatchers/objects.ts";
import { createFollowListener } from "./listeners/follow.ts";
import { createCreateListener } from "./listeners/create.ts";

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
createFollowListener(federation);
createCreateListener(federation);

export default federation;