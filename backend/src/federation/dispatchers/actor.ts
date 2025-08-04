import { Image, Person, importJwk } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { User } from "../../models/user.ts";
import { UserService } from "../../services/userService.ts";

const logger = getLogger("federation");
const userService = new UserService();

export function createActorDispatcher(federation: any) {
  federation.setActorDispatcher("/users/{identifier}", async (ctx: any, identifier: string) => {
    logger.info(`Actor dispatcher called for: ${identifier}`);
    
    const user = await userService.findByUsername(identifier);
    if (!user) {
      logger.info(`User not found: ${identifier}`);
      return null;
    }
    
    logger.info(`Serving actor: ${user.username}`);
    const keys = await ctx.getActorKeyPairs(identifier);
    
    return new Person({
      id: ctx.getActorUri(identifier),
      preferredUsername: user.username,
      name: user.displayName,
      summary: user.bio || "",
      
      icon: user.avatarUrl ? new Image({
        url: new URL(user.avatarUrl),
        mediaType: "image/jpeg",
      }) : undefined,
      
      inbox: ctx.getInboxUri(identifier),
      outbox: ctx.getOutboxUri(identifier),
      followers: ctx.getFollowersUri(identifier),
      following: ctx.getFollowingUri(identifier),
          
      discoverable: !user.isPrivate,
      indexable: !user.isPrivate,
      manuallyApprovesFollowers: user.isPrivate,

      publicKey: keys[0]?.cryptographicKey,
      assertionMethods: keys.map((key: any) => key.multikey),
    });
  }).setKeyPairsDispatcher(async (ctx: any, identifier: string) => {
    const urlParts = identifier.split('/');
    const username = urlParts[urlParts.length - 1];
      
    const user = await User.findOne({ username, isLocal: true });
    if (!user) {
      return [];
    }
      
    if (!user.keyPairs || user.keyPairs.length === 0) {
      logger.warn(`No key pairs found for user: ${username}`);
      return [];
    }
    
    try {
      const keyPairs = await Promise.all(user.keyPairs.map(async (keyPair: any) => {
        if (!keyPair.privateKey) {
          return null;
        }
        
        return {
          publicKey: await importJwk(keyPair.publicKey, 'public'),
          privateKey: await importJwk(keyPair.privateKey, 'private'),
        };
      }));
      
      return keyPairs.filter((keyPair): keyPair is { publicKey: CryptoKey; privateKey: CryptoKey } => keyPair !== null);
    } catch (error) {
      logger.error(`Error importing key pairs for user ${username}:`, { error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  });
}