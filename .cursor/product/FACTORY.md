# Software factory direction (darts)

Short north star for agentic delivery. **Not** a mandate to build platform infra yet.

## Now (MVP)

| Piece | Where |
| --- | --- |
| Ask-first ticket refine | `/refine <n>` → `.cursor/skills/ticket-refine/SKILL.MD` |
| Discover → stop → lean brief | `.cursor/agents/product-owner.md` |
| Board Ready bar | `.cursor/product/BOARD.md` |
| Escalate / stop when blocked | PO agent output contract |

Goal: each Ready ticket is decision-complete and lean enough to build/test without re-interviewing.

## Next (after a few refine cycles)

| Piece | Intent |
| --- | --- |
| ADRs | Add `.cursor/product/adr/` (or `docs/adr/`) as source of truth for hard-to-reverse choices; agents read on plan/validate |
| Model per step | Prefer larger models for plan/PO/validate/tests; faster models for FE implement — where Cursor agent frontmatter allows |
| Proof on Done | Screenshots / test results / short notes as evidence the feature does what the AC said |

## Later

| Piece | Intent |
| --- | --- |
| Parallel specialists | After Ready, spawn design/QA/db with short context in parallel when independent |
| Platform (K8s, OIDC, Bedrock, Gas Town, …) | Only if local Cursor agents + Issues stop scaling |

## Explicitly out of scope for now

Installing novelty skills (grill-me, Caveman, …), generating agent sprawl, self-hosted LLM farms, or rewriting the whole board for factory theatre.
