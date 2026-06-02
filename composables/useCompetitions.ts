import { ref, readonly } from "vue";
import { CompetitionService } from "../database/CompetitionService";
import { CompetitionEditionService } from "../database/CompetitionEditionService";
import { MatchService } from "../database/MatchService";
import type {
  Competition,
  Head2HeadOverviewItem,
} from "../interfaces/competition";
import { buildHead2HeadOverviewItem } from "../utils/rivalry";
import { cloneCompetition } from "../utils/competition";

const competitionService = new CompetitionService();
const editionService = new CompetitionEditionService();
const matchService = new MatchService();

export function useCompetitions() {
  const competitions = ref<Competition[]>([]);
  const head2HeadOverview = ref<Head2HeadOverviewItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const saveCompetition = async (competition: Competition) => {
    loading.value = true;
    error.value = null;
    try {
      const saved = await competitionService.upsert(
        cloneCompetition(competition)
      );
      const index = competitions.value.findIndex((c) => c.id === saved.id);
      if (index > -1) {
        competitions.value[index] = saved;
      } else {
        competitions.value.push(saved);
      }
      return saved;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to save competition";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCompetition = async (id: string) => {
    return await competitionService.get(id);
  };

  const loadHead2HeadOverview = async () => {
    loading.value = true;
    error.value = null;
    try {
      const comps = await competitionService.getHead2HeadCompetitions();
      competitions.value = comps;

      const items: Head2HeadOverviewItem[] = [];

      for (const competition of comps) {
        const edition = await editionService.getCurrentEdition(competition.id);
        if (!edition) continue;

        const matches = await matchService.getMatchesForCompetitionEdition(
          edition
        );
        items.push(buildHead2HeadOverviewItem(competition, edition, matches));
      }

      items.sort(
        (a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime()
      );

      head2HeadOverview.value = items;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load head2head overview";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return {
    competitions: readonly(competitions),
    head2HeadOverview: readonly(head2HeadOverview),
    loading: readonly(loading),
    error: readonly(error),
    saveCompetition,
    getCompetition,
    loadHead2HeadOverview,
  };
}
