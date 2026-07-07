import Dexie from "dexie";
import { v4 as uuid } from "uuid";
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

    // Version 6: edition players via playerStats only (drop playerIds)
    this.version(6)
      .stores({
        players: "id, firstName, lastName, alias, createdAt, updatedAt",
        competitions: "id, competitionType, createdAt, updatedAt",
        competitionEditions:
          "id, competitionId, editionNumber, *playerStats, createdAt, updatedAt, winner",
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
          "id, playerId, matchId, setId, playerLegId, competitionEditionId, createdAt, updatedAt",
      })
      .upgrade(async (tx) => {
        console.log(
          "Migrating database to version 6: edition playerStats replace playerIds",
        );

        const editionsTable = tx.table("competitionEditions");
        const statsTable = tx.table("playerStats");
        const editions = await editionsTable.toArray();

        for (const edition of editions) {
          const legacyPlayerIds = edition.playerIds as string[] | undefined;
          let statsIds = [...(edition.playerStats ?? [])];

          if (legacyPlayerIds?.length) {
            const existingStats = (
              await Promise.all(statsIds.map((id: string) => statsTable.get(id)))
            ).filter(Boolean);

            const coveredPlayerIds = new Set(
              existingStats.map((stat) => stat.playerId as string),
            );

            for (const playerId of legacyPlayerIds) {
              if (coveredPlayerIds.has(playerId)) continue;

              const statId = uuid();
              await statsTable.add({
                id: statId,
                createdAt: new Date(),
                updatedAt: new Date(),
                playerId,
                competitionEditionId: edition.id,
                average: 0,
                scoringDartsAverage: 0,
                scores: {
                  "0-9": 0,
                  "10-19": 0,
                  "20-29": 0,
                  "30-39": 0,
                  "40-53": 0,
                  "54-65": 0,
                  "66-89": 0,
                  "90-125": 0,
                  "126-161": 0,
                  "162-179": 0,
                  "180": 0,
                  goldenCamel: 0,
                },
                checkouts: {
                  "0-40": { thrown: 0, hit: 0 },
                  "41-60": { thrown: 0, hit: 0 },
                  "61-80": { thrown: 0, hit: 0 },
                  "81-100": { thrown: 0, hit: 0 },
                  "101-130": { thrown: 0, hit: 0 },
                  "131-150": { thrown: 0, hit: 0 },
                  "151-170": { thrown: 0, hit: 0 },
                },
                highestCheckout: 0,
                doubles: { thrown: 0, hit: 0 },
              });
              statsIds.push(statId);
            }

            for (const stat of existingStats) {
              if (!stat.competitionEditionId) {
                stat.competitionEditionId = edition.id;
                await statsTable.put(stat);
              }
            }

            delete edition.playerIds;
            edition.playerStats = statsIds;
            await editionsTable.put(edition);
          }
        }
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
