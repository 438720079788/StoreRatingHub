import { 
  users, 
  stores, 
  ratings, 
  type User, 
  type InsertUser, 
  type Store,
  type InsertStore,
  type Rating,
  type InsertRating,
  type StoreWithRatings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sql, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Interface for storage operations
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  deleteUser(id: number): Promise<void>;
  
  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  getStoreWithRatings(id: number): Promise<StoreWithRatings | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: InsertStore): Promise<Store | undefined>;
  deleteStore(id: number): Promise<void>;
  getAllStores(): Promise<Store[]>;
  getStoresByOwner(ownerId: number): Promise<Store[]>;
  getStoreCount(): Promise<number>;
  
  // Rating operations
  getRating(id: number): Promise<Rating | undefined>;
  getRatingByUserAndStore(userId: number, storeId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, rating: InsertRating): Promise<Rating>;
  deleteRating(id: number): Promise<void>;
  getAllRatings(): Promise<Rating[]>;
  getRatingsByUser(userId: number): Promise<Rating[]>;
  getRatingsByStore(storeId: number): Promise<Rating[]>;
  getRatingsByStores(storeIds: number[]): Promise<Rating[]>;
  getRatingCount(): Promise<number>;
  getRecentRatingsByStores(storeIds: number[], limit: number): Promise<any[]>;
  
  // Stats and activity
  getRecentActivity(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.created_at));
  }
  
  async getUserCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }
  
  async deleteUser(id: number): Promise<void> {
    // First delete all ratings by this user
    await db.delete(ratings).where(eq(ratings.user_id, id));
    
    // Then delete all stores owned by this user
    const userStores = await db.select().from(stores).where(eq(stores.owner_id, id));
    for (const store of userStores) {
      await db.delete(ratings).where(eq(ratings.store_id, store.id));
    }
    await db.delete(stores).where(eq(stores.owner_id, id));
    
    // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
  }
  
  // Store operations
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }
  
  async getStoreWithRatings(id: number): Promise<StoreWithRatings | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    
    if (!store) return undefined;
    
    const storeRatings = await db.select().from(ratings).where(eq(ratings.store_id, id));
    const [storeOwner] = await db.select().from(users).where(eq(users.id, store.owner_id));
    
    // Calculate average rating
    const totalRatings = storeRatings.length;
    const averageRating = totalRatings > 0 
      ? storeRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    return {
      ...store,
      ratings: storeRatings,
      owner: storeOwner,
      averageRating,
      totalRatings
    };
  }
  
  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }
  
  async updateStore(id: number, storeData: InsertStore): Promise<Store | undefined> {
    const [updatedStore] = await db
      .update(stores)
      .set(storeData)
      .where(eq(stores.id, id))
      .returning();
    
    return updatedStore;
  }
  
  async deleteStore(id: number): Promise<void> {
    // First delete all ratings for this store
    await db.delete(ratings).where(eq(ratings.store_id, id));
    
    // Then delete the store
    await db.delete(stores).where(eq(stores.id, id));
  }
  
  async getAllStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(stores.name);
  }
  
  async getStoresByOwner(ownerId: number): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.owner_id, ownerId));
  }
  
  async getStoreCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(stores);
    return result.count;
  }
  
  // Rating operations
  async getRating(id: number): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }
  
  async getRatingByUserAndStore(userId: number, storeId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(
        eq(ratings.user_id, userId),
        eq(ratings.store_id, storeId)
      ));
    
    return rating;
  }
  
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }
  
  async updateRating(id: number, ratingData: InsertRating): Promise<Rating> {
    const [updatedRating] = await db
      .update(ratings)
      .set(ratingData)
      .where(eq(ratings.id, id))
      .returning();
    
    return updatedRating;
  }
  
  async deleteRating(id: number): Promise<void> {
    await db.delete(ratings).where(eq(ratings.id, id));
  }
  
  async getAllRatings(): Promise<Rating[]> {
    return await db.select().from(ratings).orderBy(desc(ratings.created_at));
  }
  
  async getRatingsByUser(userId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.user_id, userId))
      .orderBy(desc(ratings.created_at));
  }
  
  async getRatingsByStore(storeId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.store_id, storeId))
      .orderBy(desc(ratings.created_at));
  }
  
  async getRatingsByStores(storeIds: number[]): Promise<Rating[]> {
    if (storeIds.length === 0) return [];
    
    return await db
      .select()
      .from(ratings)
      .where(inArray(ratings.store_id, storeIds))
      .orderBy(desc(ratings.created_at));
  }
  
  async getRatingCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(ratings);
    return result.count;
  }
  
  async getRecentRatingsByStores(storeIds: number[], limit: number): Promise<any[]> {
    if (storeIds.length === 0) return [];
    
    const recentRatings = await db.query.ratings.findMany({
      where: inArray(ratings.store_id, storeIds),
      with: {
        user: true,
        store: true,
      },
      orderBy: [desc(ratings.created_at)],
      limit,
    });
    
    return recentRatings;
  }
  
  // Stats and activity
  async getRecentActivity(): Promise<any[]> {
    const recentRatings = await db.query.ratings.findMany({
      with: {
        user: true,
        store: true,
      },
      orderBy: [desc(ratings.created_at)],
      limit: 10,
    });
    
    const recentStores = await db.query.stores.findMany({
      with: {
        owner: true,
      },
      orderBy: [desc(stores.created_at)],
      limit: 5,
    });
    
    // Combine and sort by created_at
    const activity = [
      ...recentRatings.map(r => ({ 
        type: 'rating', 
        created_at: r.created_at, 
        user: r.user,
        store: r.store,
        rating: r.rating
      })),
      ...recentStores.map(s => ({ 
        type: 'store', 
        created_at: s.created_at, 
        user: s.owner,
        store: s
      }))
    ];
    
    return activity.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 10);
  }
}

export const storage = new DatabaseStorage();
