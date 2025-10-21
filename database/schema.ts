import Dexie from "dexie";
import type { Player } from "../interfaces/player";
import type { Match } from "../interfaces/match";

export class DartsDatabase extends Dexie {
  // Define tables
  players!: Dexie.Table<Player>;
  matches!: Dexie.Table<Match>;

  constructor() {
    super("DartsDatabase");

    this.version(1).stores({
      players: "id, firstName, lastName, alias, createdAt, updatedAt",
      matches: "id, gameType, players, matchConfig, createdAt, updatedAt",
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
