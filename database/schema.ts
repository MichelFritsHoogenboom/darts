import Dexie from "dexie";
import type { Player } from "../interfaces/player";
import type { Match } from "../interfaces/match";
import type { Set } from "../interfaces/set";
import type { Leg, PlayerLeg, Score, SingleDartScore } from "../interfaces/leg";
import type { PlayerStats } from "../interfaces/stats";
import type { Competition, CompetitionEdition } from "../interfaces/competition";

export class DartsDatabase extends Dexie {
  // Define tables
  players!: Dexie.Table<Player>;
  competitions!: Dexie.Table<Competition>;
  competitionEditions!: Dexie.Table<CompetitionEdition>;
  matches!: Dexie.Table<Match>;
  sets!: Dexie.Table<Set>;
  legs!: Dexie.Table<Leg>;
  playerLegs!: Dexie.Table<PlayerLeg>;
  scores!: Dexie.Table<Score>;
  singleDartScores!: Dexie.Table<SingleDartScore>;
  playerStats!: Dexie.Table<PlayerStats>;

  constructor() {
    super("DartsDatabase");

    // Version 1: Initial schema
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

    // Version 2: Added multi-entry indexes for array fields (players)
    // Note: Remove regular 'players' index and only keep '*players' multi-entry index
    this.version(2)
      .stores({
        players: "id, firstName, lastName, alias, createdAt, updatedAt",
        matches:
          "id, gameType, *players, matchConfig, createdAt, updatedAt, winner",
        sets: "id, matchId, legs, createdAt, updatedAt, *players, winner",
        legs: "id, matchId, setId, gameType, *players, startingPlayer, winner, createdAt, updatedAt",
        playerLegs:
          "id, legId, playerId, scores, average, createdAt, updatedAt",
        scores: "id, playerLegId, playerId, totalScore, createdAt, updatedAt",
        singleDartScores:
          "id, scoreId, playerId, score, createdAt, updatedAt, doubleHit, isSetDart, isMatchDart",
      })
      .upgrade(async (tx) => {
        // Migration logic: Dexie will automatically rebuild indexes
        // No data transformation needed - just re-indexing
        console.log(
          "Migrating database to version 2: Adding multi-entry indexes for players arrays"
        );
      });

    // Version 3: Added playerStats table
    this.version(3)
      .stores({
        players: "id, firstName, lastName, alias, createdAt, updatedAt",
        matches:
          "id, gameType, *players, matchConfig, createdAt, updatedAt, winner",
        sets: "id, matchId, legs, createdAt, updatedAt, *players, winner",
        legs: "id, matchId, setId, gameType, *players, startingPlayer, winner, createdAt, updatedAt",
        playerLegs:
          "id, legId, playerId, scores, average, createdAt, updatedAt",
        scores: "id, playerLegId, playerId, totalScore, createdAt, updatedAt",
        singleDartScores:
          "id, scoreId, playerId, score, createdAt, updatedAt, doubleHit, isSetDart, isMatchDart",
        playerStats:
          "id, playerId, matchId, setId, playerLegId, createdAt, updatedAt",
      })
      .upgrade(async (tx) => {
        console.log(
          "Migrating database to version 3: Adding playerStats table"
        );
      });

    // Version 4: Added matchId and setId indexes to scores table
    this.version(4)
      .stores({
        players: "id, firstName, lastName, alias, createdAt, updatedAt",
        matches:
          "id, gameType, *players, matchConfig, createdAt, updatedAt, winner",
        sets: "id, matchId, legs, createdAt, updatedAt, *players, winner",
        legs: "id, matchId, setId, gameType, *players, startingPlayer, winner, createdAt, updatedAt",
        playerLegs:
          "id, legId, playerId, scores, average, createdAt, updatedAt",
        scores:
          "id, playerLegId, playerId, matchId, setId, totalScore, createdAt, updatedAt",
        singleDartScores:
          "id, scoreId, playerId, score, createdAt, updatedAt, doubleHit, isSetDart, isMatchDart",
        playerStats:
          "id, playerId, matchId, setId, playerLegId, createdAt, updatedAt",
      })
      .upgrade(async (tx) => {
        console.log(
          "Migrating database to version 4: Adding matchId and setId indexes to scores table"
        );
      });

    // Version 5: Competitions, editions, match.competitionEditionId
    this.version(5)
      .stores({
        players: "id, firstName, lastName, alias, createdAt, updatedAt",
        competitions: "id, competitionType, createdAt, updatedAt",
        competitionEditions:
          "id, competitionId, editionNumber, *playerIds, createdAt, updatedAt, winner",
        matches:
          "id, gameType, *players, matchConfig, competitionEditionId, createdAt, updatedAt, winner",
        sets: "id, matchId, legs, createdAt, updatedAt, *players, winner",
        legs: "id, matchId, setId, gameType, *players, startingPlayer, winner, createdAt, updatedAt",
        playerLegs:
          "id, legId, playerId, scores, average, createdAt, updatedAt",
        scores:
          "id, playerLegId, playerId, matchId, setId, totalScore, createdAt, updatedAt",
        singleDartScores:
          "id, scoreId, playerId, score, createdAt, updatedAt, doubleHit, isSetDart, isMatchDart",
        playerStats:
          "id, playerId, matchId, setId, playerLegId, createdAt, updatedAt",
      })
      .upgrade(async () => {
        console.log(
          "Migrating database to version 5: competitions, competitionEditions, competitionEditionId on matches"
        );
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
