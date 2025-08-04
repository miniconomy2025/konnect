import type { NextFunction, Request, Response } from "express";
import federation from "../federation/setup.ts";

/**
 * Middleware to attach federation context to requests
 * This should be used before routes that need to send ActivityPub activities
 */
export function attachFederationContext(req: Request, res: Response, next: NextFunction) {
  try {
    const domain = process.env.DOMAIN || 'localhost:8000';
    const protocol = domain.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}`;
    
    const federationContext = federation.createContext(
      new URL(req.originalUrl, baseUrl),
      {
        request: req,
        response: res
      }
    );
    
    (req as any).federationContext = federationContext;
    
    next();
  } catch (error) {
    console.error('Failed to create federation context:', error);
    next();
  }
}