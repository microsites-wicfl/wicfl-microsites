# Operator guide

**Version 1.0 · 4 Sep 2026 · Written for Pavel ahead of the 17 Sep handoff, closes backlog item
W-102.** Read this before the handoff session, not during it. Bring questions the session
doesn't answer; each one gets logged, because a gap this guide misses is a defect in the guide,
not in you.

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

## Part 2 — The reference documents, and when to open each

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

## Part 3 — The rules that don't bend

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

## Part 4 — Who to ask, and about what

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
