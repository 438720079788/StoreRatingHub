import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertStoreSchema, 
  insertRatingSchema, 
  InsertStore, 
  InsertRating 
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "You must be logged in" });
};

// Middleware to check user role
const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    
    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ message: "You do not have permission to access this resource" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // User routes
  app.get("/api/users", hasRole(['admin']), async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });
  
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    // Only allow users to view their own profile unless they're an admin
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to view this user" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  app.delete("/api/users/:id", hasRole(['admin']), async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.status(204).send();
  });
  
  // Store routes
  app.get("/api/stores", async (req, res) => {
    const stores = await storage.getAllStores();
    res.json(stores);
  });
  
  app.get("/api/stores/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const store = await storage.getStoreWithRatings(id);
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    
    res.json(store);
  });
  
  app.post("/api/stores", hasRole(['admin', 'store_owner']), async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body) as InsertStore;
      
      // If store owner is creating a store, set the owner_id to their user ID
      if (req.user!.role === 'store_owner') {
        validatedData.owner_id = req.user!.id;
      }
      
      const store = await storage.createStore(validatedData);
      res.status(201).json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      throw error;
    }
  });
  
  app.put("/api/stores/:id", hasRole(['admin', 'store_owner']), async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if user owns this store or is an admin
    if (req.user!.role === 'store_owner') {
      const store = await storage.getStore(id);
      if (!store || store.owner_id !== req.user!.id) {
        return res.status(403).json({ message: "You do not have permission to update this store" });
      }
    }
    
    try {
      const validatedData = insertStoreSchema.parse(req.body) as InsertStore;
      const store = await storage.updateStore(id, validatedData);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      res.json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      throw error;
    }
  });
  
  app.delete("/api/stores/:id", hasRole(['admin', 'store_owner']), async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if user owns this store or is an admin
    if (req.user!.role === 'store_owner') {
      const store = await storage.getStore(id);
      if (!store || store.owner_id !== req.user!.id) {
        return res.status(403).json({ message: "You do not have permission to delete this store" });
      }
    }
    
    await storage.deleteStore(id);
    res.status(204).send();
  });
  
  // Rating routes
  app.get("/api/ratings", async (req, res) => {
    const ratings = await storage.getAllRatings();
    res.json(ratings);
  });
  
  app.get("/api/ratings/user/:userId", isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Only allow users to view their own ratings unless they're an admin
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to view these ratings" });
    }
    
    const ratings = await storage.getRatingsByUser(userId);
    res.json(ratings);
  });
  
  app.get("/api/ratings/store/:storeId", async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const ratings = await storage.getRatingsByStore(storeId);
    res.json(ratings);
  });
  
  app.post("/api/ratings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body) as InsertRating;
      
      // Set the user_id to the current user
      validatedData.user_id = req.user!.id;
      
      // Check if user has already rated this store
      const existingRating = await storage.getRatingByUserAndStore(req.user!.id, validatedData.store_id);
      
      if (existingRating) {
        // Update existing rating
        const rating = await storage.updateRating(existingRating.id, validatedData);
        return res.json(rating);
      }
      
      // Create new rating
      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      throw error;
    }
  });
  
  app.delete("/api/ratings/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Check if user owns this rating or is an admin
    const rating = await storage.getRating(id);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }
    
    if (rating.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to delete this rating" });
    }
    
    await storage.deleteRating(id);
    res.status(204).send();
  });
  
  // Dashboard stats routes
  app.get("/api/stats/admin", hasRole(['admin']), async (req, res) => {
    const userCount = await storage.getUserCount();
    const storeCount = await storage.getStoreCount();
    const ratingCount = await storage.getRatingCount();
    const recentActivity = await storage.getRecentActivity();
    
    res.json({
      userCount,
      storeCount,
      ratingCount,
      recentActivity
    });
  });
  
  app.get("/api/stats/store-owner", hasRole(['store_owner']), async (req, res) => {
    const ownerId = req.user!.id;
    const stores = await storage.getStoresByOwner(ownerId);
    const storeIds = stores.map(store => store.id);
    
    const storeCount = stores.length;
    const ratings = await storage.getRatingsByStores(storeIds);
    
    // Calculate average rating across all stores
    let totalRatings = 0;
    let ratingSum = 0;
    
    ratings.forEach(rating => {
      totalRatings++;
      ratingSum += rating.rating;
    });
    
    const averageRating = totalRatings > 0 ? ratingSum / totalRatings : 0;
    
    // Get store performance data
    const storePerformance = await Promise.all(
      stores.map(async (store) => {
        const storeRatings = await storage.getRatingsByStore(store.id);
        let ratingDistribution = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        };
        
        storeRatings.forEach(rating => {
          ratingDistribution[rating.rating as 1 | 2 | 3 | 4 | 5]++;
        });
        
        const totalRatings = storeRatings.length;
        const averageRating = totalRatings > 0 
          ? storeRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
          : 0;
        
        return {
          id: store.id,
          name: store.name,
          totalRatings,
          averageRating,
          ratingDistribution
        };
      })
    );
    
    // Get recent ratings
    const recentRatings = await storage.getRecentRatingsByStores(storeIds, 10);
    
    res.json({
      storeCount,
      totalRatings,
      averageRating,
      storePerformance,
      recentRatings
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
