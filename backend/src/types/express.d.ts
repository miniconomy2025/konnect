import type { Context } from "@fedify/fedify";
import type { IUser } from "../models/user.ts";

declare global {
  namespace Express {
    interface Request {
      federationContext?: Context<void | unknown>;
      user?: IUser;
    }
  }
}

export { };

