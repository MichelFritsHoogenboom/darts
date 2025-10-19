import { getDatabase } from "./schema";
import { initializeDatabase } from "./init";

/**
 * Generic database service for common CRUD operations
 */
export class DatabaseService {
  /**
   * Ensure database is initialized before operations (safety net)
   */
  static async ensureDatabase() {
    const db = getDatabase();
    if (!db.isOpen()) {
      await initializeDatabase();
    }
    return db;
  }

  /**
   * Generic method to add or update a record
   * If the record exists (based on id), it updates; otherwise, it creates
   */
  static async upsert<
    T extends { id: string; createdAt: Date; updatedAt: Date }
  >(table: any, data: T): Promise<T> {
    await this.ensureDatabase();
    console.log("data", data);
    // Debug logging
    console.log(
      "DatabaseService.upsert - data.id:",
      data.id,
      "type:",
      typeof data.id
    );

    if (!data.id || typeof data.id !== "string") {
      throw new Error(
        `Invalid ID provided: ${data.id} (type: ${typeof data.id})`
      );
    }

    const existingRecord = await table.get(data.id);

    if (existingRecord) {
      // Update existing record - preserve createdAt, update updatedAt
      data.updatedAt = new Date();
      await table.update(data.id, data);
      return data;
    } else {
      // Create new record - set both timestamps
      data.createdAt = new Date();
      data.updatedAt = new Date();
      await table.add(data);
      return data;
    }
  }

  /**
   * Generic method to get a record by ID
   */
  static async getById<T>(table: any, id: string): Promise<T | undefined> {
    await this.ensureDatabase();
    return await table.get(id);
  }

  /**
   * Generic method to get all records
   */
  static async getAll<T>(table: any): Promise<T[]> {
    await this.ensureDatabase();
    return await table.toArray();
  }

  /**
   * Generic method to delete a record by ID
   */
  static async deleteById(table: any, id: string): Promise<void> {
    await this.ensureDatabase();
    await table.delete(id);
  }

  /**
   * Generic method to search records
   */
  static async search<T>(
    table: any,
    searchTerm: string,
    searchFields: string[]
  ): Promise<T[]> {
    await this.ensureDatabase();
    return await table
      .filter((record: any) => {
        return searchFields.some((field) => {
          const value = record[field];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      })
      .toArray();
  }
}
