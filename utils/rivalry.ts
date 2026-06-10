import type { Match } from "../interfaces/match";
import type {
  Competition,
  CompetitionEdition,
  Head2HeadOverviewItem,
} from "../interfaces/competition";

export function sortPlayerIds(ids: string[]): [string, string] {
  const sorted = [...ids].sort();
  if (sorted.length !== 2) {
    throw new Error("Head2Head requires exactly two player IDs");
  }
  return [sorted[0], sorted[1]];
}

export function playerIdsMatch(
  editionPlayerIds: string[],
  sortedPair: [string, string]
): boolean {
  if (editionPlayerIds.length !== 2) return false;
  const sorted = [...editionPlayerIds].sort();
  return sorted[0] === sortedPair[0] && sorted[1] === sortedPair[1];
}

export function computeEditionStandings(
  edition: CompetitionEdition,
  matches: Match[]
): Record<string, number> {
  const standings: Record<string, number> = {};
  for (const playerId of edition.playerIds) {
    standings[playerId] = 0;
  }

  const editionMatchIds = new Set(edition.matches);
  for (const match of matches) {
    if (!editionMatchIds.has(match.id) || !match.winner) continue;
    if (standings[match.winner] !== undefined) {
      standings[match.winner] += 1;
    }
  }

  return standings;
}

export function isEditionComplete(
  edition: CompetitionEdition,
  matches: Match[]
): boolean {
  const { amountMatches } = edition.competitionConfig;
  const editionMatches = matches.filter((m) => edition.matches.includes(m.id));
  const finished = editionMatches.filter((m) => m.winner);
  return finished.length >= amountMatches;
}

export function hasUnfinishedMatch(matches: Match[]): boolean {
  return matches.some((m) => !m.winner);
}

export function canStartNewMatch(
  edition: CompetitionEdition,
  matches: Match[]
): boolean {
  if (edition.winner) return false;
  if (hasUnfinishedMatch(matches)) return false;
  const editionMatches = matches.filter((m) => edition.matches.includes(m.id));
  const finishedCount = editionMatches.filter((m) => m.winner).length;
  return finishedCount < edition.competitionConfig.amountMatches;
}

export function getEditionLastActiveAt(
  edition: CompetitionEdition,
  matches: Match[]
): Date {
  let maxTime = edition.updatedAt.getTime();
  const editionMatchIds = new Set(edition.matches);
  for (const match of matches) {
    if (!editionMatchIds.has(match.id)) continue;
    const t = match.updatedAt.getTime();
    if (t > maxTime) maxTime = t;
  }
  return new Date(maxTime);
}

export function getEditionMatchWinner(
  edition: CompetitionEdition,
  matches: Match[]
): string | undefined {
  if (!isEditionComplete(edition, matches)) return undefined;

  const standings = computeEditionStandings(edition, matches);
  let bestId: string | undefined;
  let bestWins = -1;

  for (const playerId of edition.playerIds) {
    const wins = standings[playerId] ?? 0;
    if (wins > bestWins) {
      bestWins = wins;
      bestId = playerId;
    }
  }

  return bestId;
}

export function buildHead2HeadOverviewItem(
  competition: Competition,
  edition: CompetitionEdition,
  matches: Match[]
): Head2HeadOverviewItem {
  return {
    competition,
    edition,
    matches,
    standings: computeEditionStandings(edition, matches),
    lastActiveAt: getEditionLastActiveAt(edition, matches),
  };
}

export function findHead2HeadCompetitionFromEditions(
  editions: CompetitionEdition[],
  competitions: Competition[],
  playerId1: string,
  playerId2: string
): Competition | undefined {
  const sorted = sortPlayerIds([playerId1, playerId2]);
  const edition = editions.find((e) => playerIdsMatch(e.playerIds, sorted));
  if (!edition) return undefined;

  return competitions.find((c) => c.id === edition.competitionId);
}
