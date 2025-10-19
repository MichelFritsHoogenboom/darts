import Dexie, { Table } from "dexie";
import type { Player } from "../interfaces/player";

export class DartsDatabase extends Dexie {
  // Define tables
  players!: Table<Player>;

  constructor() {
    super("DartsDatabase");

    this.version(1).stores({
      players: "id, firstName, lastName, alias, createdAt, updatedAt",
    });
  }
}

// Singleton pattern to ensure only one database instance
let dbInstance: DartsDatabase | null = null;

export function getDatabase(): DartsDatabase {
  if (!dbInstance) {
    dbInstance = new DartsDatabase();
  }
  return dbInstance;
}

// Export the singleton instance for convenience
export const db = getDatabase();
