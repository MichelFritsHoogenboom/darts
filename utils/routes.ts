export const routes = {
  home: "/",
  setup: "/setup",
  matchDetail: (matchId: string) => `/match/${matchId}`,
  head2head: {
    index: "/head2head",
    create: "/head2head/create",
    season: (competitionId: string, editionNumber: number) =>
      `/head2head/${competitionId}/season/${editionNumber}`,
    setup: (competitionId: string) => `/head2head/${competitionId}/setup`,
  },
} as const;
