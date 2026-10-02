# Product vision — darts

Living source of truth for agents and humans. Prefer updating this file (+ mirroring GitHub Issue “Product vision”) when decisions change — do **not** ask the user to re-explain from scratch.

Last updated: 2026-10-02 (conversation with product owner).

---

## End product

Public **website** (marketing / download) **plus** a downloadable / installable **app** for scoring and stats.

Not the primary goal yet to SEO-index private match data. App chrome stays local-first for now; marketing pages come later.

## Who it’s for (now → later)

| Horizon | Audience |
| --- | --- |
| **Now** | Offline friend groups who dart face-to-face (starting with the builder + fixed opponents). |
| **Next** | Local leagues that run their own competitions/tournaments and compare players. |
| **Also** | Solo players who train alone — **career mode** + **good bots** so they don’t wait for a human. |

## vs DartCounter (and similar)

| Them (roughly) | Us |
| --- | --- |
| Strong on **online** play | Focus on **offline face-to-face** evenings |
| Rich stats often **behind paywall** | **Extensive statistics free** |
| — | Later **paid**: sync across devices/friends (+ other paid features TBD) — **not** locking core stats |

**Steer product decisions** toward a unique set outside “online multiplayer race”. Lean into: local scoring ritual, seasons/rivalry, rich free stats/graphs, later leagues & solo career — not copying DartCounter’s online core.

## How an evening should feel

- **During play:** rivalry can be present (season standing, recent history) but the **score entry UI stays calm** — not a crowded dashboard while typing scores.
- **After / next day:** graphs first, then stats, then who won which leg. Deeper later: stolen legs/sets, etc.

## Product pillars (priority order agreed)

1. **Foundation** — finish design/FE/QA/DB/security/a11y baseline so new work stays clean. Season page is the visual bar; homepage and other pages should share one design system.
2. **Seasons / H2H polish** — bugs, new-season settings choice (#21), season-level graphs, richer H2H overview, proper back navigation.
3. **Player pages** (+ wire into match summaries, leaderboards, etc.) — see below.
4. **Bots** — human-like form/waves/player types (not flat average + always checkout).
5. **Tournaments / competitions** — with friends, and solo (e.g. replay World Grand Prix) once bots exist.
6. **Marketing / download site** — when ready to go public (#39).
7. **Sync / paid** — later; undefined feature set except “sync + friends” direction.

## Player pages (target)

- Default info, photo, **darts setup** (linked to matches → later: which setup performs better).
- Match list with filters; graph like match graphs but over a **selectable time range**.
- **Form** next to name (derived from data).
- **Titles** from won tournaments (needs tournaments).
- Clickable names (+ photos) from match summaries, leaderboards, etc. → player page.
- **Compare** with other players: H2H results, titles, etc.

Ship as slices (v1 profile + links first; depth later) — sequence lives in the GitHub Project **roadmap** view + Issues.

## Bots (quality bar)

A bot feels bad if it always checks out and scores a flat average.

Wanted model:

- Top and floor around a base level; **form** above/below base; form comes and goes; some players have a narrower in/out-of-form range.
- In-match **waves**: scoring and checkout % vary within range during the match.
- **Player types**: e.g. heavy scorers / weak finishers or the reverse.

## Monetization (direction only)

Free: scoring, rivalry/seasons, rich stats.  
Paid (later): sync across devices/friends; other paid features TBD.  
Do not put core stats behind a paywall.

## Related board memory

- Process / kanban: `.cursor/product/BOARD.md`
- Near-term sequencing: GitHub Project **roadmap** view (not a repo markdown file)
- This file is the vision source of truth — **not** a GitHub Issue
