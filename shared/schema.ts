import { pgTable, text, serial, integer, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum for users
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'store_owner']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  address: varchar("address", { length: 400 }).notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Stores table
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  address: varchar("address", { length: 400 }).notNull(),
  owner_id: integer("owner_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  store_id: integer("store_id").notNull().references(() => stores.id),
  user_id: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  stores: many(stores),
  ratings: many(ratings)
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.owner_id],
    references: [users.id]
  }),
  ratings: many(ratings)
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  store: one(stores, {
    fields: [ratings.store_id],
    references: [stores.id]
  }),
  user: one(users, {
    fields: [ratings.user_id],
    references: [users.id]
  })
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
    password: z.string().min(8, "Password must be at least 8 characters").max(16, "Password must be at most 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    email: z.string().email("Invalid email format"),
    address: z.string().max(400, "Address must be at most 400 characters"),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

export const insertStoreSchema = createInsertSchema(stores)
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    name: z.string().min(1, "Store name is required"),
    email: z.string().email("Invalid email format"),
    address: z.string().max(400, "Address must be at most 400 characters")
  });

export const insertRatingSchema = createInsertSchema(ratings)
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    review: z.string().optional()
  });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Join types for convenience
export type StoreWithRatings = Store & {
  ratings: Rating[];
  owner: User;
  averageRating?: number;
  totalRatings?: number;
};

export type UserWithRatings = User & {
  ratings: Rating[];
};
