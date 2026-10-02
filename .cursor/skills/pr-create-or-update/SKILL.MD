---
name: pr-create-or-update
description: >-
  Builds a GitHub pull request body from .github/pull_request_template.md when
  present (or a Dutch freeform body when it is missing), using the branch diff
  against main, then creates or updates the PR via gh. Writing is for human
  reviewers: clear, precise, plain language. Use for PR descriptions, template
  fill, GitHub sync, gh pr create, or gh pr edit.
---

# Create or update pull request from branch

## Source of truth: `pull_request_template.md`

**Try to read `.github/pull_request_template.md` first** (again if it may have changed).

- **If the file exists:** the filled PR body must:
  1. **Reuse every `### …` heading** from that file **in the same order** — character-for-character headings, including emoji.
  2. **Reuse list/checklist wording** from the template where it is meant to stay fixed (see per-section rules). Do **not** invent alternate section titles or skip a section because it is empty in the template.
  3. **Only substitute content** under each heading (and replace placeholders such as `ID` in URLs). If GitHub adds a **new** `###` section later, fill it with concise Dutch (or English if the heading is English-only) inferred from the heading name and the diff; keep the same heading text as in the file.

  The per-heading rules below explain **how to fill** each part of **whatever** the template contains; they do not replace reading the file.

- **If the file is missing:** do **not** fall back to English for the PR title or body just because there is no template. Follow [Geen pull_request_template.md](#geen-pull_request_templatemd) and still use the git diff + `gh` flow.

## Geen pull_request_template.md

When `.github/pull_request_template.md` **does not exist** in the repo (or this run targets a repo without that file):

1. **Taal:** schrijf de **PR-titel** en **volledige beschrijving** in het **Nederlands**, met [English waar het hoort](#dutch-prose-english-where-it-belongs). Een ontbrekend template is **geen** reden om de body in het Engels te schrijven.

2. **Alleen deze twee body-secties — geen eigen koppen erbij:** de markdown-body bestaat **uitsluitend** uit deze twee `##`-koppen, in deze volgorde, zonder extra tussen- of eindsecties:
   - `## Wijzigingen` — `-` bullets, **één beknopte zin per bullet**, volgens [Wijzigingen (inhoud en detail)](#wijzigingen-inhoud-en-detail).
   - `## Stappen om te testen` — genummerde stappen voor hoe reviewers het kunnen **(her)testen**; zie [Stappen om te testen (detail)](#stappen-om-te-testen-detail) voor toon en inhoud, maar **niet** de template-specifieke verplichting tot Netlify/preview-URL’s (hieronder).

   **Verboden zonder expliciete gebruikersvraag in dit gesprek:** zelf `## Samenvatting`, `## Testomgeving`, deploy-/preview-URL-blokken, **Crowdin**-keylijsten, **changeset**-teksten, **checklist**-checkboxen, **ERT**, **Type wijziging**, of andere koppen die uit **andere** repo-templates bekend zijn. Voeg die **niet** toe om de PR “compleet” te laten lijken — die secties horen alleen bij een **echt** `pull_request_template.md` in **deze** repo of als de gebruiker ze nu expliciet vraagt.

3. **Geen verzonnen of gekopieerde URL’s:** zet **geen** Netlify- of deploy-preview-URL’s in de body, **geen** `ID`- of PR-nummer-placeholders, en **geen** links uit een template van een **andere** codebase. Alleen URL’s gebruiken die de **gebruiker in hetzelfde verzoek** geeft of die **letterlijk** in documentatie **van deze repo** staan (en kloppen). Anders: teststappen **zonder** deploy-URL (bijv. lokaal draaien, route openen, scenario beschrijven).

4. **`gh`:** je hoeft het PR-nummer **niet** op te lossen alleen voor fictieve preview-URL’s; [PR number and preview URLs](#pr-number-and-preview-urls) geldt zonder template **niet** voor verplichte deploy-links.

## Goal

1. Build the description from the **template + branch diff** when the template exists, or from the **diff + Dutch freeform body** per [Geen pull_request_template.md](#geen-pull_request_templatemd) when it does not.
2. **Publish on GitHub:** follow [GitHub CLI (`gh`)](#github-cli-gh) — use `gh pr view` to resolve the PR number **only** when [PR number and preview URLs](#pr-number-and-preview-urls) applies (template met `ID` in URL’s), then `gh pr create` or `gh pr edit` with the final body.

## Branch

- Use a **non-`main`** branch. Do **not** add commits on `main`, merge to `main`, or rewrite `main` as part of this skill.
- If the current branch is `main`, stop and say the user must switch to or create a feature branch before creating/updating a PR.

## Audience and tone (human readers)

Reviewers read this on GitHub without the diff open. Every section must be **human-readable**, **precise**, and **easy to scan**.

- **Plain language:** short sentences; avoid filler (“in order to”, “leverages”, “robust solution”). Prefer concrete verbs (*toegevoegd*, *verwijderd*, *aangepast*, *fix voor*).
- **Precise:** say *what* changed and *where* (component, app, user-visible effect). Avoid vague claims (“improved UX”) without *what* a tester should see.
- **Scannable:** bullets and numbered steps; one main idea per line; consistent terms (same naam voor dezelfde component/sectie).
- **Test steps:** each step should make sense **standalone** — reviewer knows **where** to go, **what** to do, and **what “good” looks like** (expected outcome).
- **No machine-only output:** no raw dump of commit hashes, no unexplained internal codenames, no ambiguous “it/the above” without a noun.

Apply this to **Wijzigingen**, **Stappen om te testen**, and any free-text template section — not to verbatim template lines you must copy (URLs, type bullet, checklist labels).

**Wijzigingen — lengte:** de sectie moet **snel te scannen** zijn. Liever **te kort** dan een mini-essay per bullet; details staan in de diff. Zie [Wijzigingen (inhoud en detail)](#wijzigingen-inhoud-en-detail).

### Dutch prose, English where it belongs

- **Default:** write narrative in **Dutch** for reviewer-facing sections (Wijzigingen, test steps, ERT, plus any other free-text blocks **that the template actually defines**) unless a template section is explicitly English-only.
- **Zonder template in deze repo:** de PR-body bevat alleen [Geen pull_request_template.md](#geen-pull_request_templatemd) — dus **geen** aparte `## Samenvatting` of andere extra koppen, tenzij de gebruiker dat in dit gesprek expliciet vraagt.
- **Keep English** for anything that matches **code or product context**: component/file/API names as they appear in the repo, library and tool names (`React`, `GraphQL`, `Netlify`), hook/function names, env vars, and other terms reviewers will see in the diff. Do **not** translate those for the sake of Dutch-only prose — mix naturally (*“de `UserCard` component toont nu …”*, *“GraphQL query uitgebreid met …”*).

### Links in the PR body (GitHub markdown)

- **Clickable links:** use standard markdown `[tekst of URL](https://…)` or a **bare** `https://…` URL. GitHub renders those as links.
- **Do not** wrap whole URLs in **backticks** — that renders as monospace code and is **not** clickable.
- Backticks stay appropriate for **paths**, **symbols**, and **short code fragments**, not for “here is the preview URL” lines.

## Before writing

1. **Template:** read `.github/pull_request_template.md` if it exists (structure + placeholders). If it **does not** exist, follow [Geen pull_request_template.md](#geen-pull_request_templatemd) instead of template section rules.
2. Compare against **`main`** (default). If absent locally, use `origin/main`. Use the **same `<base>` ref** for all `git log` / `git diff` commands.

```bash
git rev-parse --abbrev-ref HEAD
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
git diff <base>...HEAD --name-only
```

## PR number and preview URLs

When the **template** defines **Testomgeving** / deploy lines with an `ID` placeholder:

1. Resolve the GitHub PR number when possible: `gh pr view --json number,url`.
2. In the **Testomgeving** section, **take every deploy URL line from the template** and replace the placeholder `ID` with that **number**. Do **not** change hostnames, paths, or the `deploy-preview-…--…` pattern — they must stay aligned with the template.
3. If no number is known yet: keep `ID` as in the template, or follow the sync flow (create PR → re-edit body with the real number).
4. **Stappen om te testen** must use the **same concrete URLs** (with the same number) as in Testomgeving, formatted as **markdown links or bare URLs** — never only backtick-wrapped URLs.

When there is **no** template, **do not** invent a Testomgeving block or PR-number-based deploy URL’s — this whole subsection **does not apply**. Resolve the PR number only if the **user** gave real URLs in the conversation that still need substitution (zeldzaam); default is **skip**.

## How to fill each template section

**Only when** `.github/pull_request_template.md` exists: walk the template **top to bottom**. Apply the rule for the heading you see.

### `### ⏱ Estimated Review Time (ERT)`

Replace the placeholder under it with a **realistic time for a human reviewer** to understand the PR and leave useful feedback — not build time or CI time.

**Base the estimate on the diff and risk**, for example:

- **Scope:** number of files/lines touched, number of `apps/*` or packages involved, depth of logic vs. copy/style-only.
- **Cognitive load:** new patterns or APIs, cross-cutting refactors, security/auth/data-shape changes need more review time than localized UI tweaks.
- **How reviewers use it:** reading description + diff, following non-trivial test steps, or re-reading related code adds time; say so in the estimate when the test plan is long or the diff is dense.

**Format (pick one, keep it short):**

- Prefer a **minute range** reviewers can plan around, e.g. `~10–15 min`, `~25–40 min`, `~1–1.5 h` (round to sensible steps; avoid false precision).
- Optionally add **XS / S / M / L** *after* the range if the template or team expects it, e.g. `~20–30 min (M)`.

**Sanity bands (guide, not law):** trivial / single-file / obvious fix **~5–15 min**; typical feature touching a few modules **~15–45 min**; large or risky (multi-app, refactor, security-sensitive) **~45 min–2 h+**. Adjust upward if the checklist or test steps are heavy.

### `### ⌨️ Type wijziging`

The template lists **four** full-line options. Output **only the single option that applies**: **one** `-` bullet whose text is **verbatim one of those four lines** from the template (same spelling/capitalisation). **Omit** the other three bullets entirely. If the branch is mixed, pick the **dominant** type; you may add **at most** one extra **Wijzigingen** bullet — a **single** clarifying sentence — not a second type line.

### `### 🌐 Testomgeving`

- Preserve the **HTML comment** from the template if present.
- Copy **all** Netlify URL lines from the template; replace **`ID`** with the real PR number when known.
- Output each deploy URL as a **clickable** markdown link or bare URL (see [Links in the PR body](#links-in-the-pr-body-github-markdown)); match the template’s link style when it already uses `[…](…)` — if the template used backticks for URLs, **convert** those lines to clickable links while keeping hostnames and paths unchanged.

### `### ✍️ Wijzigingen`

Follow [Wijzigingen (inhoud en detail)](#wijzigingen-inhoud-en-detail): **één korte zin per bullet**, geen lange ketens over stores/API’s tenzij echt nodig voor review. **No** checklist or Crowdin notes here.

### `### 🪜 Stappen om te testen`

Follow [Stappen om te testen (detail)](#stappen-om-te-testen-detail). Use the **exact preview URLs** (with PR number) that appear under Testomgeving, formatted as [clickable links](#links-in-the-pr-body-github-markdown).

### `### 🇬🇧 Crowdin keys om toe te voegen`

- If no keys / no locale-Crowdin-related diff: put **`N.V.T.`** only (no long explanation).
- If there are keys: list them briefly.

### `### ✅ Checklist`

- Keep **the same checklist lines** as in the template (same wording after the checkbox).
- Only change **`[ ]` → `[x]`** when evidence supports it; never alter the label text.
- **No** extra lines or commentary under the checklist.

#### Checklist interpretation (match template lines by meaning)

- **Changeset:** `- [x]` if `.changeset/` appears in the branch diff (add or meaningful change); else `- [ ]`.
- **Code verwerkt voor alle apps:** `- [x]` only if **every** top-level folder under `apps/` in the repo has at least one touched path in the diff; otherwise `- [ ]`. When in doubt, `- [ ]`.

### New sections in the template

If a new `###` heading appears in `.github/pull_request_template.md` that is not listed above: add concise content under it derived from the **heading label** and the **git diff**; use Dutch for prose with [English where it belongs](#dutch-prose-english-where-it-belongs) unless the template is clearly English-only for that block.

## Wijzigingen (inhoud en detail)

- **One idea, one sentence:** each `-` is **exactly one sentence** — no multi-sentence bullets or mini-paragraphs.
- **Kort en licht:** richt op **~12–22 woorden** per zin waar het kan (ongeveer **één regel** in de GitHub-preview). Geen opsomming van elke tussenstap (`store` → actie → component) tenzij de reviewer **zonder** die hint echt de kern mist; dan maximaal **één** compacte verwijzing (bv. één store- of propnaam), niet een hele doorloop.
- **Geen proza-stapel:** vermijd lange ketens met *waarbij*, *wordt meegestuurd*, *wordt doorgegeven aan* voor alle ontvangers — noem **wat** er gebruikers- of reviewkant toegevoegd is en **waar** het hoofdzakelijk zit; de diff vult de rest aan.
- **Bundelen:** meerdere bestanden met **dezelfde soort** wijziging (alleen markup/volgorde, alleen vertalingen, alleen `.cursor`-regels) → **één** bullet. Zuiver cosmetische Vue/formatter-aanpassingen **zonder** gedrag: één regel als *“Opruiming: … (geen functionele wijziging).”*
- **Aantal bullets:** liever **minder, kortere** regels dan veel middellange; richtlijn **~3–6** bullets voor een typische feature-PR, **~2–4** voor kleine PR’s, **grote** PR’s alleen uitbreiden als er echt **gescheiden** reviewthema’s zijn (niet om elk bestand te vermelden).
- **Voor reviewers:** elke zin = *wat* is er veranderd + (zo nodig) *waarom het voor review telt* — in lijn met [Audience and tone](#audience-and-tone-human-readers) en [Dutch prose, English where it belongs](#dutch-prose-english-where-it-belongs).
- **Concreet:** component-, route- of APInamen **zoals in code**; geen exhaustive filepath-lijsten.
- **Per app** (`apps/*`): één korte noem als meerdere sites geraakt zijn.

## Stappen om te testen (detail)

- **For humans:** steps must read like instructions to a colleague — see [Audience and tone](#audience-and-tone-human-readers) and [Dutch prose, English where it belongs](#dutch-prose-english-where-it-belongs).
- Per stap: **waar** (URL as [clickable link](#links-in-the-pr-body-github-markdown)), **wat** (pagina/sectie/gedrag), **controleren** (verwacht resultaat, hover/focus, layout).
- Minstens één stap per **geraakte** app in de diff; voor andere apps in de template-URL-set: korte rooktest. **Zonder** template: geen fictieve multi-app-URL-set — stappen afstemmen op wat uit de diff en lokale run haalbaar is.
- **Responsive** alleen als de diff dat raakt.
- Richtlijn: **6–12** genummerde stappen voor een middelgrote PR.

## GitHub CLI (`gh`)

Always complete the flow with **`gh pr create`** or **`gh pr edit`** and the filled body (after [Branch](#branch) checks).

1. **Existing PR:** `gh pr view --json number,state,title,url`. On failure → no PR.
2. **Order:** resolve number **only** when the template has `ID` in deploy URL’s → build **final** body from **template + rules** or **no-template Dutch body** ([alleen twee secties](#geen-pull_request_templatemd)) → `gh pr edit <n> --body-file <tmp>` or `gh pr create ... --body-file <tmp>`. Re-edit after create if the first body still had `ID` in **template** URLs.
3. **Temp file:** e.g. `mktemp /tmp/pr-body.XXXXXX.md`.
4. **Failures:** missing `gh`, auth, push/base — short actionable hints.

## Output rules

- **Never** overwrite `.github/pull_request_template.md` unless the user explicitly asks.
- **PR body:** if a template exists, the markdown passed to `gh` spans from the **first `###` in the template** through the **last checklist line** of the template (same heading set), unless the user wants extra commentary outside that block. If **no** template exists, the body is **only** `## Wijzigingen` + `## Stappen om te testen` per [Geen pull_request_template.md](#geen-pull_request_templatemd) — **geen** extra door de agent toegevoegde koppen of secties.
- **Dutch** for prose (including **no-template** PRs) unless a template section is explicitly English-only; follow [Dutch prose, English where it belongs](#dutch-prose-english-where-it-belongs). **Links:** follow [Links in the PR body](#links-in-the-pr-body-github-markdown).
- **Quality bar:** the full body should read as if written for a **human code review** — clear, exact, no unnecessary jargon; see [Audience and tone](#audience-and-tone-human-readers).

## Optional Cursor command

`commands/pr-create-or-update.md` invokes this skill.