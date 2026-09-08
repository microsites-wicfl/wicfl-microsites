# Operator guide

**Version 1.1 · 8 Sep 2026 · Written for Pavel ahead of the 17 Sep handoff, closes backlog item
W-102.** Read this before the handoff session, not during it. Bring questions the session
doesn't answer; each one gets logged, because a gap this guide misses is a defect in the guide,
not in you.

*Updated 8 Sep 2026: added Part 2 below, the exact click-by-click GitHub steps. The first draft
assumed you already knew git and GitHub; that assumption was wrong, and this version doesn't
make it. Everything in Part 2 was clicked through for real on this repository before being
written down — see `BITACORA.md`, 8 Sep 2026.*

This is the guide, not the reference material. It tells you what this repo is, what you touch,
what you never touch, and how a week actually goes. When you need the exact schema fields, the
content rules, or the launch checklist, it points you to the document that owns that answer
instead of repeating it here out of date.

## Part 1 — The mental model

### This is a factory, not a website

This repo does not contain a site. It contains the system that generates sites. A microsite is
the output of one config file plus a folder of markdown, run through a shared template. Nobody
opens an HTML file and edits it. If a site needs something the template can't currently produce,
that is a gap in the template, and the fix happens once, in the template, for every site at
once, not by hand-patching the one site that needed it.

This matters for a concrete reason: two things in your own planning document assumed a different
model than the one this framework actually uses, and both are worth naming directly so they
don't quietly resurface in October.

**Sites are generated, never hand-built.** Your document described building sites by hand.
Here, a site is `sites/<slug>/site.config.json` plus `sites/<slug>/content/*.md`, and the
generator turns that into the live site. You never touch HTML, CSS, or the template's code. If
you find yourself wanting to, stop and flag it. Wanting to edit a template file usually means
the template is missing something, and that's a framework change, not a per-site patch.

**You write the content yourself. Nothing ships from an AI-generated brief.** Your document
proposed content generated from briefs. `docs/CONTENT_STANDARDS.md` draws this line explicitly,
and it matters more than it might look: Google's scaled content abuse policy applies "no matter
how it's created," and a hundred pages written to a brief and generated at volume is exactly the
profile that policy targets. AI is fine as a drafting or research aid that you then edit into
something true and specific. It is not fine as the pipeline that ships a page. Every page you
publish, you wrote, in the language it's written in. Spanish content especially: written in
Spanish from the start, never translated and never generated from an English brief. Real license
numbers, real local detail, your own market knowledge in the copy.

Neither of these was a mistake on your part. Nobody had told you the constraints when you wrote
that document. They're written down now so they don't have to be re-explained per site.

### What you touch, and what you never touch

**Yours, every time:**
- `sites/<slug>/site.config.json` — the one site you're working on
- `sites/<slug>/content/*.md` — its pages
- `sites/<slug>/public/` — its logo and any other brand image, once one exists (see below)

**Never, under any circumstance:**
- `packages/template/` — the shared Astro template, layouts, components
- `packages/config-schema/` — the contract every config validates against
- `scripts/` — the generator, the build pipeline, the CI logic
- `.github/workflows/` — CI, preview deploys, production deploys
- Any other site's `sites/<other-slug>/`

If something in that second list needs to change to make your site work, that's not your fix.
Flag it. A config field that's missing, a template layout that can't do what a page needs, a
build error that isn't about your content: all of those are framework questions, and Gate A
(13 Nov) is partly measuring exactly this boundary. `git diff --name-only` against your own
commits should only ever show files under `sites/<your-slug>/`.

### What a week actually looks like, during Site #1 (21 Sep – 9 Oct)

Roughly, in the order it happens:

1. Spec the page or the site with the `microsite-brief` skill if you're starting fresh — it
   produces the config, the page map, and the differentiation plan before anything is generated.
2. Write markdown, page by page. As each page is drafted, run the `differentiation-audit` skill
   on it. Not at the end of the week, not before launch: on the page, while it's still cheap to
   fix. This is the single most important habit in this guide. Skipping it doesn't block
   anything today, which is exactly why it's the step that gets skipped, and exactly why
   `docs/CONTENT_STANDARDS.md` calls it out by name.
3. Push a branch. A pull request gets you a live preview URL automatically, posted as a comment
   and updated on every push. You do not need a local dev server running to see your work
   rendered; that exists too (`docs/SETUP.md`) but it's a convenience, not a requirement.
4. Before you ask for it to merge, run the self-review checklist in `docs/CONTENT_STANDARDS.md`
   and the full launch checklist in `docs/QA_CHECKLIST.md`. Both are yours to run; nobody else
   currently reviews before you (see the note on that below).
5. Merge. Once the real production deploy is turned on for a site, that's what ships it live.

### Who reviews your content

Nobody else does, right now. `docs/CONTENT_STANDARDS.md`'s self-review checklist exists because
there's no second person on the team to be a dedicated reviewer today. You can ask Kevin
informally when something feels ambiguous — a coverage claim, an edge case only a licensed agent
should assert — but that's your call, not a required approval step. This is a floor, not a
substitute for licensed review, and it gets revisited if the portfolio grows past the three
pilot sites. You're not being asked to carry more risk quietly; it's written down as a known gap
on purpose.

## Part 2 — Doing it: GitHub, click by click, assuming nothing

Part 1 told you what you touch and why. This part is what was missing: exactly what to click,
in order, to make a change and get it live, assuming you've never used git or GitHub before.
Every step below was clicked through for real on this repository, twice, on 8 Sep 2026 (see
`BITACORA.md`), not written from memory of how GitHub usually works.

### A short glossary

You'll see these words on GitHub itself and in the rest of this guide. You don't need to
understand git as a system, just what these particular words mean here.

- **Repo (repository)** — the project's files and their entire history, all together. This one
  lives at `github.com/microsites-wicfl/wicfl-microsites`.
- **`main`** — the one copy of the repo that's "real." Whatever's live, or about to go live,
  always traces back to `main`.
- **Branch** — a separate, parallel copy of the files where you can make changes without
  touching `main` yet. When you edit a file on GitHub's website, GitHub creates one of these for
  you automatically. You'll see a checkbox for it, but you never have to name it or manage it
  yourself.
- **Commit** — a saved snapshot of the exact lines you changed, labeled with a short message.
  GitHub creates this when you click "Commit changes."
- **Pull request (PR)** — a request to bring your branch's changes into `main`. It's a page
  where you (and, if something fails, Vic) can see exactly what changed, and where automated
  checks run before anything merges.
- **Checks** — automated jobs that run on every pull request. `Validate and build` checks your
  config and content are well-formed and builds the site to make sure nothing is broken.
  `Preview deploy` publishes a temporary, live copy of your exact changes so you can look at the
  real rendered page before it goes anywhere near production. Green check means it passed; red X
  means something's wrong — see "If a check fails" below.
- **Merge** — folding your branch's changes into `main`. This is the one step that feels
  permanent; everything before it can be abandoned without a trace.

### Editing a page that already exists

1. Go to `github.com/microsites-wicfl/wicfl-microsites` and sign in.
2. Click into `sites/<your-site>/content/`, then click the `.md` file you want to change (for
   example `flood-coverage.md`).
3. Click the pencil icon in the top-right of the file view ("Edit this file").
4. Edit the text. It's plain markdown: `## Heading` for a heading, a blank line between
   paragraphs, `[link text](/some-slug/)` for a link. If you're unsure what a piece of markdown
   will look like once rendered, that's exactly what the preview step below is for.
5. Scroll to the bottom. Under "Commit changes," write a short message describing what changed
   (for example "Update flood deductible figures").
6. Make sure the second option is selected: **"Create a new branch for this commit and start a
   pull request."** Not the first one — that tries to save straight to `main`.
7. Click **"Propose changes."**
8. You land on a "comparing changes" page. The title box is pre-filled from your commit message
   — edit it if you want something clearer. Click **"Create pull request."**
9. You're now on the pull request page. Wait a minute or two, refreshing if needed, while the
   two automated checks run.
10. Once `Preview deploy` finishes, a comment appears on the PR from GitHub Actions with a link
    that looks like `https://wicfl-prNN-<slug>.wicfl-microsites.workers.dev`. Click it: this is
    your exact change, live, before anyone else sees it.
11. Look at the real page. Then run the self-review checklist in `docs/CONTENT_STANDARDS.md`,
    and `docs/QA_CHECKLIST.md` if this is a launch-readiness pass.
12. If both checks are green and the preview looks right, click the green **"Merge pull
    request"** button, then the confirm button that appears under it. Afterward, GitHub offers a
    **"Delete branch"** button — click it; the branch was only scaffolding for the PR.
13. `main` now has your change. The temporary preview Worker deletes itself automatically a few
    minutes after the PR closes, merged or not — that's expected, and separate from the real,
    permanent site.

### Creating a brand-new page

A page is one markdown file. Here's the exact recipe.

1. Go to `sites/<your-site>/content/` in the repo.
2. Click the **"Add file"** dropdown near the top-right of the file listing, then **"Create new
   file."**
3. In the **"Name your file..."** field, type a filename ending in `.md`: lowercase words
   separated by hyphens, no spaces — for example `flood-coverage.md`. **This filename becomes
   the page's web address automatically once it's live**: `flood-coverage.md` becomes the page
   at `/flood-coverage/`. There's no separate "URL" field anywhere; the filename is the address,
   so get it right the first time (renaming the file later changes the page's URL).
4. In the editor, the very first thing in the file has to be a frontmatter block: three dashes,
   some fields, three dashes, before any of your actual content.

   ```
   ---
   title: "Flood Coverage in Miami-Dade"
   description: "What flood insurance covers and doesn't, explained plainly."
   pageType: content
   ---

   Your page content starts here, as normal markdown.
   ```

   - `title` — required. The page's headline and browser-tab title.
   - `description` — optional, but write one anyway; it's what shows up in search results and
     social previews.
   - `pageType` — required, and must be exactly one of three words: `home`, `content`, or
     `coverage`. Every site has exactly one `home` page (`index.md`, its front page — don't
     create a second one). For everything else use `content`, unless the page is specifically
     about what a coverage type does or doesn't cover, in which case `coverage` gives it a small
     visual treatment (a divider under the header) built for that. If you're genuinely unsure
     which of `content`/`coverage` fits, use `content` and ask Vic — it's a styling choice, not
     something that can break the build.
   - Nothing else goes in that block. A field name that doesn't exist here will fail the
     `Validate and build` check — that's the schema doing its job, not a bug.
5. Scroll down and commit exactly as in steps 5–13 above: new branch, pull request, wait for
   checks, preview, review, merge.

**The one thing that will bite you if you skip it:** this site has no navigation menu anywhere —
no header links, no footer sitemap, nothing that lists pages automatically. A page you publish
this way is live at its URL, but unreachable by anyone clicking around the site unless another
page links to it. So before you merge a new page, edit at least one existing page (the home page
is the usual choice) and add a plain markdown link to it, for example
`[Flood coverage in Miami-Dade](/flood-coverage/)` — as part of the same pull request or a
follow-up one. A page nothing links to is a page Google and every real visitor will never find.

### A worked example: what a finished page's markdown actually looks like

The frontmatter contract above is only three lines. Here's a full example of what a real page
looks like once you write it, structure and all, so you have something to pattern-match against
instead of a blank editor. **Don't copy this text into a real page** — the sentences below are
illustrative, not researched or approved copy, and `docs/CONTENT_STANDARDS.md` requires every
real page to be your own writing, specific to that market:

```
---
title: "Windstorm Coverage for Stuart, FL Homeowners"
description: "What windstorm coverage typically includes for waterfront homes in Martin
  County, and what to confirm with your agent."
pageType: coverage
---

Homes along the St. Lucie River and the Intracoastal in Stuart carry windstorm exposure that
most inland Florida homes don't face the same way. Here's what a windstorm endorsement
generally covers, and where the specifics come down to your policy and your agent.

## What's typically included

- Wind and hail damage to the structure of your home
- Damage from wind-driven rain that enters through a wind-created opening
- Detached structures on your property, like a dock or a screened lanai, when your policy
  lists them

## What's usually excluded, or needs a separate policy

- Flood damage from storm surge, even during the same storm, always requires a separate flood
  policy
- Damage from lack of maintenance rather than the storm itself

Coverage limits, deductibles, and exact terms vary by policy. Confirm your specific windstorm
deductible with your Walker Insurance Company of Florida agent before hurricane season.

See also our [flood coverage page](/flood-coverage/) for how storm surge is handled separately.
```

Notice what each part is doing, and why it's there:

- **Real, local detail** ("St. Lucie River," "Martin County," "dock," "screened lanai") — this
  is exactly what the swap test in `docs/CONTENT_STANDARDS.md` is looking for. Swap the city and
  most of this paragraph stops being true, which is the point.
- **Qualified language** ("generally," "typically," "usually," "confirm with your agent") —
  never a guaranteed or absolute claim ("always covered," "guaranteed approval"). That's
  self-review checklist item 3.
- **No license number, no entity disclaimer typed by hand** — the template renders those
  automatically from `site.config.json` on every page. If you find yourself typing a license
  number into a content file, stop, that's a sign something's wrong.
- **An internal link** (`[flood coverage page](/flood-coverage/)`) — plain markdown link syntax,
  pointing at another page's slug. This is also how a page gets linked to, not just from — see
  the warning above about pages that aren't reachable from anywhere.
- **`pageType: coverage`** — because this page is specifically about what one coverage type does
  and doesn't cover. A general page (an About page, a service-area page) would use `content`
  instead.

### If a check fails

A red X next to `Validate and build` or `Preview deploy` on your pull request means something's
wrong, usually a frontmatter typo (a missing `title`, a `pageType` that isn't one of the three
allowed words) or a markdown syntax slip. Click the red X, then "Details," to read what failed.
If the message doesn't make it obvious what to fix, don't guess and don't start editing files
outside `sites/<your-slug>/` to work around it: copy the error and message Vic with a link to
the pull request. A confusing error message is itself something worth reporting, not something
to route around.

## Part 3 — The reference documents, and when to open each

Don't read all of these cover to cover before the handoff. Skim this guide fully, skim
`docs/ARCHITECTURE.md` for the decisions and why they were made, and treat the rest as reference
you open when the situation in front of you calls for it.

| Document | Open it when... |
|---|---|
| `docs/ARCHITECTURE.md` | You want the decisions and the reasoning behind them, once, before the handoff |
| `docs/SITE_CONFIG_SCHEMA.md` | You're filling in or debugging a `site.config.json` |
| `docs/SITE_CONFIG_SCHEMA.md`, design decision 7 | You're adding a logo — drop the file in `sites/<slug>/public/` and point `brand.logo` at it |
| `docs/CONTENT_STANDARDS.md` | You're writing a page, always — the swap test, the AI-use rules, the self-review checklist all live here |
| `docs/QA_CHECKLIST.md` | You think a page or a site is ready to publish |
| `docs/SETUP.md` | You want a local dev server running, or you're troubleshooting the deploy pipeline itself |
| `docs/GATE_B_MODEL.md` | You want to understand what "qualified call" means and why the Gate B bar is built the way it is |
| `BACKLOG.md` | You want to know what's built, what's deliberately not built yet, and why |

And two skills you'll run yourself, not just read about:

- **`microsite-brief`** — specs a new site or a new page before it's generated. Produces the
  config, the page map, and the differentiation plan.
- **`differentiation-audit`** — the swap test, run as a skill instead of a mental exercise. Run
  it per page, while writing.

## Part 4 — The rules that don't bend

A short list, pulled from `CLAUDE.md`, that applies to your work specifically:

1. **No site is built by hand.** It's generated from its config. If the generator can't produce
   something you need, that's a generator problem, not a reason to hand-edit output.
2. **The swap test is law.** There's a CI gate for it once Site #2 exists to compare against
   (W-027), but during Site #1 the only thing enforcing it is you running the skill per page.
3. **Spanish is written, not translated.** Every time, no exceptions, for the reason in
   `docs/CONTENT_STANDARDS.md`.
4. **No AI-generated page ships unreviewed**, and no page ships generated from a brief without
   you writing and editing it into something true and specific to that market.
5. **License numbers, NAP, and Florida advertising rules apply on every page**, every time,
   checked against the self-review checklist before publish.

## Part 5 — Who to ask, and about what

- **Vic** — anything about the template, the schema, the pipeline, the generator, or a question
  this guide didn't answer. Log the question; it goes into fixing the guide or the framework,
  not just answering you once.
- **Kevin** — brand assets, niche and domain approval, budget, Google Business Profiles, and
  anything that's a business call rather than a content or technical one.

## What's still open when you read this

Written 4 Sep 2026, before the handoff. A few things this guide describes are not fully live
yet: production deploys are built but not yet turned on for a real site (they wait on real brand
and analytics data replacing the current placeholders), and the differentiation CI gate doesn't
exist until Site #2 has content to compare against. None of that changes what you do; it changes
what's automatic versus what's still on you in the meantime. `BACKLOG.md` is the source of truth
for exactly what's built versus pending, if this guide and reality ever disagree, believe the
backlog.
