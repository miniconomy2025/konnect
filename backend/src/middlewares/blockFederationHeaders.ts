import type { NextFunction, Request, Response } from "express";

export async function blockFederationHeaders(req: Request, res: Response, next: NextFunction) {
  const acceptHeader = req.headers.accept || '';
  const isActivityPubRequest = acceptHeader.includes('application/activity+json') ||
                              acceptHeader.includes('application/ld+json');

  if (isActivityPubRequest) { 
    return res.status(406).json({
      error: 'ActivityPub requests should be handled by Fedify federation middleware'
    })
  } else {
    next();
  }

}
