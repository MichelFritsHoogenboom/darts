import { v4 as uuid } from "uuid";
import type { GameType, Match } from "./match";
import type { x01MatchConfig } from "./x01MatchConfig";

export const COMPETITION_TYPES = {
  head2head: "head2head",
} as const;

export type CompetitionType =
  (typeof COMPETITION_TYPES)[keyof typeof COMPETITION_TYPES];

export interface CompetitionConfig {
  matchConfig?: x01MatchConfig;
  gameType?: GameType;
  amountMatches: number;
}

export interface Competition {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  competitionType: CompetitionType;
  name?: string;
  defaultCompetitionConfig?: CompetitionConfig;
}

export interface CompetitionEdition {
  id: string;
  competitionId: string;
  editionNumber: number;
  createdAt: Date;
  updatedAt: Date;
  playerIds: string[];
  competitionConfig: CompetitionConfig;
  playerStats: string[];
  matches: string[];
  winner?: string;
}

export interface Head2HeadOverviewItem {
  competition: Competition;
  edition: CompetitionEdition;
  matches: Match[];
  standings: Record<string, number>;
  lastActiveAt: Date;
}

export function createCompetition(
  overrides: Partial<Competition> = {}
): Competition {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    competitionType: COMPETITION_TYPES.head2head,
    ...overrides,
  };
}

export function createCompetitionEdition(
  overrides: Partial<CompetitionEdition> & {
    competitionId: string;
    competitionConfig: CompetitionConfig;
    playerIds: string[];
  }
): CompetitionEdition {
  return {
    id: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    editionNumber: 1,
    playerStats: [],
    matches: [],
    ...overrides,
  };
}
