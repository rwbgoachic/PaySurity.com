import { Request, Response, NextFunction } from "express";

/**
 * Helper to ensure user is authenticated
 */
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

/**
 * Helper to ensure user belongs to the merchant
 */
export const ensureLegalMerchant = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // This would typically check if the user belongs to the merchant
  // For testing purposes, we'll just pass it through
  // In a real implementation, you would verify the merchant ID is valid for this user
  next();
};