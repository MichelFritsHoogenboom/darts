import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faHandshake, faPeopleArrows } from "@fortawesome/free-solid-svg-icons";

export const GAME_TYPES = {
  x01: "x01",
  tactics: "tactics",
  halveIt: "halve-it",
} as const;

export const AMOUNT_MATCH_OPTIONS = [3, 7, 9, 11, 13, 15, 17, 19, 21].map(
  (amount) => ({
    value: amount,
    label: `${amount} matches`,
  }),
);

export const MATCH_TYPE_META = {
  friendly: { icon: faHandshake, title: "Friendly" },
  head2head: { icon: faPeopleArrows, title: "Head to Head" },
} as const satisfies Record<string, { icon: IconDefinition; title: string }>;
