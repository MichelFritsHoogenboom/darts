import Dexie from "dexie";
import type { Player } from "../interfaces/player";
import type { Match } from "../interfaces/match";
import type { Set } from "../interfaces/set";
import type { Leg, PlayerLeg, Score, SingleDartScore } from "../interfaces/leg";

export class DartsDatabase extends Dexie {
  // Define tables
  players!: Dexie.Table<Player>;
  matches!: Dexie.Table<Match>;
  sets!: Dexie.Table<Set>;
  legs!: Dexie.Table<Leg>;
  playerLegs!: Dexie.Table<PlayerLeg>;
  scores!: Dexie.Table<Score>;
  singleDartScores!: Dexie.Table<SingleDartScore>;

  constructor() {
    super("DartsDatabase");

    this.version(1).stores({
      players: "id, firstName, lastName, alias, createdAt, updatedAt",
      matches: "id, gameType, players, matchConfig, createdAt, updatedAt",
      sets: "id, matchId, legs, createdAt, updatedAt, players",
      legs: "id, matchId, setId, gameType, players, startingPlayer, winner, createdAt, updatedAt",
      playerLegs: "id, legId, playerId, scores, average, createdAt, updatedAt",
      scores: "id, playerLegId, playerId, totalScore, createdAt, updatedAt",
      singleDartScores:
        "id, scoreId, playerId, score, createdAt, updatedAt, doubleHit, isSetDart, isMatchDart",
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
