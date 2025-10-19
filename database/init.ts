import { getDatabase } from "./schema";

/**
 * Initialize the database and ensure it's ready to use
 */
export async function initializeDatabase() {
  try {
    const db = getDatabase();

    // Open the database (this will create it if it doesn't exist)
    await db.open();

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Check if the database is ready
 */
export function isDatabaseReady(): boolean {
  try {
    const db = getDatabase();
    return db.isOpen();
  } catch {
    return false;
  }
}

/**
 * Close the database connection (useful for cleanup)
 */
export async function closeDatabase() {
  try {
    const db = getDatabase();
    if (db.isOpen()) {
      await db.close();
      console.log("Database closed successfully");
    }
  } catch (error) {
    console.error("Failed to close database:", error);
  }
}
