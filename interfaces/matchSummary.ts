import { MATCH_PANEL } from "~/constants/matchSummary";

export type MatchPanel = (typeof MATCH_PANEL)[keyof typeof MATCH_PANEL];
