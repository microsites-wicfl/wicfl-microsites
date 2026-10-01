# Operator guide

**Version 2.0 · 24 Sep 2026 · Written for Pavel for the WICFL Studio training on 2 Oct.**
It replaces version 1.2 (9 Sep), which described the GitHub steps and the earlier content form.
You no longer need GitHub for anything. Read this once before the training, not during it, and
bring the questions it doesn't answer: a gap here is a defect in the guide, not in you.

Studio: **https://wicfl-studio.wicfl-microsites.workers.dev**

## Part 1 — The mental model

### This is a factory, not a website

Each microsite is generated from two things: the site's **settings** (brand, domain, phone, SEO)
and its **pages** (the text you write). A shared template turns them into the site. Nobody edits
HTML. If a site needs something the template can't do yet, that is a template change Vic makes
once for every site, never a patch on one site.

Two rules come from this, and they matter more than anything else in this guide:

**Sites are generated, never hand-built.** You work in Studio; Studio only lets you change the
site you're working on. That boundary is also what Gate A (13 Nov) measures.

**You write the content. Nothing ships from an AI-generated brief.** Google's scaled content
abuse policy applies "no matter how it's created", and a hundred pages written to a brief is
exactly what it targets. AI is fine to research or draft something you then rewrite into
something true and specific to that market. Every page that ships is yours.

**Everything is in English.** Studio, the pages, and all site content. Always.

### What you do, and what stays with Vic

**Yours, all in Studio:** the pages of each site (write, edit, create, delete, images), the
site's settings (brand name, phone and email once they exist, SEO, service area), checking the
preview, and publishing.

**Vic's:** the template and everything shared between sites, analytics and CRM IDs, putting a
site live on its domain for the first time, and anything Studio shows as "Let Vic know".

If Studio can't do something you need, don't look for a way around it. Tell Vic what you were
trying to do; that is how Studio and the template get better.

### Who reviews your content

Nobody else, for now. The self-review checklist in `docs/CONTENT_STANDARDS.md` is there because
there is no second reviewer on the team. Ask Kevin informally when something feels uncertain (a
coverage claim, something only a licensed agent should say). This is a known gap, written down
on purpose, and it is revisited if the portfolio grows past the pilot sites.

## Part 2 — Studio, step by step

### Signing in

1. Open the Studio link. Use a normal browser window, not a private one.
2. Enter your email. You get a code by email; type it in.
3. You stay signed in for a while in that browser. When the session ends, you get a new code.

If Studio says your account doesn't have access, tell Vic.

### The words Studio uses

- **Draft:** your unpublished changes to one site. Each site has at most one draft, and every
  change you save goes into it. The public never sees a draft; only people you share its
  preview link with can.
- **Preview:** a private copy of the whole site with your draft applied. It takes 2 to 4 minutes
  to update after each save.
- **Publish:** your draft becomes the site's official version.
- **Live:** the site is on its real domain for anyone to visit. Studio shows **Live at …** or
  **Not live yet** for every site.
- **Published version:** the site as it is now, without your unpublished changes. It's what goes
  live at launch. Inside a site, **View live site** opens the real site once it's live; before
  that, **View published version** opens this copy. Search engines don't index it.
- **Discard draft:** throws away all unsaved and unpublished changes on that site. It can't be
  undone.

### The dashboard

**Your sites** lists the real sites; **Practice sites** lists sites for practice that are never
published. Each card shows whether the site has **Unpublished changes** or is **Up to date**, and
whether it is live.

**Practice first.** Try anything new on **Example Flood Insurance** before doing it on a real
site. Nothing there reaches the public.

### Editing a page

1. Open the site, then the page. Each page shows its address, like `/flood-insurance/`.
2. The top fields:
   - **Title:** shown in Google and at the top of the page. Aim for under 60 characters (the
     counter helps).
   - **Description:** shown under the title in Google. Aim for 120 to 160 characters.
   - **Menu name:** the short name in the site menu. Empty means the title is used.
   - **Page type:** *Content page* or *Coverage page*. The home page is fixed.
   - **Menu position:** the page's place in the site menu. 1 goes first after Home; pages
     without a number come after the numbered ones.
   - **Show this page in the site menu:** untick for pages that shouldn't be in the menu.
3. **Page text** is on the left and the **Live preview** on the right, updating as you type.
   The text uses Markdown:
   - `## Heading` for a section heading (`###` for a smaller one)
   - `**bold**` and `*italic*`
   - `[link text](/flood-insurance/)` for a link to another page of the site
   - `- item` for a bullet list
4. Click **Save to draft**. Studio goes back to the site and the page shows **Edited**.

The live preview on the right is an approximation for writing. The **site preview** is the real
thing: once it's ready, the editor shows **Open this page in the site preview**.

If a page opens as "the whole file" instead of fields, its settings are written in a way the
fields can't show. You can still edit it; tell Vic so he fixes that page.

### Images

1. In the page editor, open **Images** and click **Add image**. JPG, PNG, WebP or GIF. Phone
   photos are fine: Studio makes big ones smaller before adding them, and removes the hidden data
   a phone stores in them, like where the photo was taken.
2. The image is inserted where your cursor is in the text, like
   `![Describe this image](/images/roof-photo.png)`.
3. Replace **Describe this image** with a real description of what it shows. That text is read
   by screen readers and by Google.
4. To reuse an image, click **Insert** under it.

### Page sections

A page can be built from ready-made sections, the ones in the homepage design. Each is a block in
the page text, like columns, and Studio writes it for you from **Page sections**:

| Button | What it is | What it needs |
|---|---|---|
| **Hero with photo** | Big photo at the top with the page's main title, subtitle, a sentence and a button | One per page, first. One photo and one `#` title (the page's main title) |
| **Icon row** | 2 to 4 short points with an icon each | Each point: `icon:`, a `###` title, one or two sentences |
| **Dark icon cards** | The same points as cards on a dark full-width band, with a title and intro | Same as the icon row |
| **Cards with photos** | 2 to 4 cards with photo, title, text and a link; the whole card is clickable | Each card: one photo, a `###` title, text, one link |
| **Questions (FAQ)** | 2 to 12 questions that open with a click; Google gets them as FAQ data automatically | Each question: a `###` line with the question, then the answer |
| **Service area** | A row of places, each with a pin | Nothing to write: places come from **Site settings → Service area** |
| **Quote band** | Full-width band with an optional photo, title, sentence, button and a short line under it | One `##` title and one button; usually last |

1. Place the cursor where the section goes (the hero always goes at the top; Studio puts it there).
2. Click the button, then replace every sample line: they only say what goes there.
3. Where it says `replace-with-your-image`, use your own image from **Images** (`/images/name.jpg`).

Lines like `eyebrow: ...` (small label above a title) and `icon: ...` at the start of a part are
settings, not text. The icon names are listed with their pictures under **Icon names for icon
rows**. A line that is only a bold link, like `**[Get a Quote](/contact/)**`, shows as a button.

A page has one main title: the hero's `#` line, or the page Title when there's no hero. Don't use
`#` anywhere else. When saving, Studio lists every line to fix and selects the first one.

### Columns

Put things side by side: an image with text next to it, or two or three columns of text.

1. For an image with text beside it: under the image in **Images**, click **With text**.
2. For text columns: in **Columns**, click **Two columns** or **Three columns**.
3. Studio adds the block where your cursor is. Replace the sample text; the live preview shows
   the columns side by side. On phones they show one under another, in the order you wrote them.

In the page text a block looks like this. Keep the three marker lines as they are:

```
:::columns
![Describe this image](/images/roof-photo.png)
:::next
The text that goes beside the image.
:::
```

`:::columns` opens the block, each `:::next` starts a new column, and `:::` closes it. Use 2 or
3 columns. If a block is left open or has a wrong number of columns, Studio says which line to
fix when you save.

### Your first homepage

There is a finished example to copy from: the Stuart homepage built with every page section,
at [https://wicfl-_example-published.wicfl-microsites.workers.dev/stuart-home-demo/](https://wicfl-_example-published.wicfl-microsites.workers.dev/stuart-home-demo/). In Studio it lives under **Practice sites → Example Flood Insurance →
Stuart homepage demo**, where you can see how each section is written. Nothing on a practice
site is ever live, so it is also the place to try things.

1. Keep the example open in one tab and the site's **Home** page in another.
2. Build from top to bottom with the **Page sections** buttons. The hero always goes first.
3. Add photos in **Images**, then place each one in its section.
4. Save; Studio points at the line to fix if a section is off. Check the preview on a phone too,
   then publish.

Photos: hero and closing banner are wide landscape photos, at least 1600 px wide, with the
subject toward the right because the text sits on the left. Cards and photos next to text are
landscape, at least 900 px wide, with what matters in the center because cards trim the edges.
Describe every photo in its text.

The example uses drawings marked *Sample image*, and the short lines under its icons were
written only to show the layout. Replace both with your own photos and words: no AI-written text
ships. Alternate light and dark sections so two with the same background don't sit together.

### Creating a page

1. On the site, click **New page**.
2. Fill in the title (Studio shows the page's address as you type), description, menu name and
   page type.
3. Click **Create page**. It opens in the editor with a starter line; replace it and save.

If Studio says the address already exists, change the title or open the existing page.

### Deleting and restoring a page

1. Open the page and click **Delete page**.
2. If other pages link to it, Studio lists them. Fix those links first, or they'll point to a
   missing page.
3. The page shows crossed out as **Will be deleted**. It stays on the site until you publish.
   Click **Restore** to bring it back.

The home page and the contact page can't be deleted.

### Checking the preview

On the site page, the **Preview** box shows one of:

- **Preparing the preview…** Wait; it refreshes by itself.
- **Preview ready.** Click **Open preview** and check every page you changed, on your phone too.
- **The preview failed.** Studio says what kind of problem it is. If it points at your last
  change, open that page and check it. Otherwise send Vic the message shown under it.

### Publishing

1. Check the preview first: every changed page, the links, the images, and the self-review
   checklist in `docs/CONTENT_STANDARDS.md`.
2. Click **Publish** and confirm. The button only works when the preview is ready.
3. What happens next depends on the site:
   - **Live site:** it updates on its domain within a few minutes.
   - **Not live yet** (before launch, or a new site): your changes become the official version,
     and they go live when Vic launches the site.

If Studio says the draft can't be published automatically, nothing was lost; tell Vic.

### Site settings

On the site, click **Site settings** to edit the brand name, phone, email, SEO title,
description and keywords, and the service area. Save puts the change into the site's draft, like
any page; check the preview and publish.

- **Phone and email:** leave them empty until Kevin provides them. Type the phone any way you
  like; Studio formats it.
- **Before this site can go live:** the list of what still blocks the launch (a placeholder, a
  "demo" in the brand or SEO, missing analytics). Items marked **(Vic)** are his. The rest are
  yours, fixed right here in the settings.

**Brand**, at the bottom of Site settings, gives each site its own look. A small preview on the
right redraws as you change anything.

- **Logo:** SVG, PNG or WebP, up to 1 MB. It's saved to the draft as soon as you upload it. An SVG
  that carries code (not just a drawing) is refused; export it again as a plain SVG, or use a PNG.
- **Logo for dark backgrounds:** a white or light version of the logo for the dark footer. Without
  it the footer shows the brand name as text. Never upload the dark logo here.
- **Style:** Rounded, Square or Soft (corners and shadows).
- **Four colors:** main (buttons, links, the bar at the top), second (small details only, never
  text), soft background (header, quotes, tables) and footer (must be dark). The text color stays
  dark on every site so it always reads well.
- **Fonts:** one for titles and one for text, from a fixed list. The sites serve them themselves.
- If a color wouldn't be readable, Studio names it, says how far off it is, and won't save until
  it's fixed. The site build checks the same rules.

### Creating a new site

1. On the dashboard, click **New site**.
2. Fill in the brand name, domain, city, county, what the site sells, who it is for, the service
   area, and the SEO title, description and main keyword.
3. **Local proof** and **Unique section** are required, and they are the heart of the
   differentiation rule: a real local fact you can back up in the content, and a section only
   this market needs, with why. If you can't fill them honestly, the site isn't ready to exist.
4. Click **Create site**. Studio creates it as a draft with three starter pages (home, contact
   and one coverage page) that say "Replace this text". Replace them all.
5. Phone, email, analytics and CRM start as placeholders, so the site can't go live with fake
   data. Publishing a new site makes it official; Vic puts it on its domain the first time.

### When something goes wrong

- Every error in Studio says what happened in plain words. If it says to let Vic know, send him
  a screenshot and what you were doing.
- **"This page changed while you were editing it":** reload and redo your change. It happens if
  the same page was saved from another tab.
- A preview link that shows "There is nothing here yet" belongs to a draft that was discarded or
  published. Use the site's current preview in Studio.

## Part 3 — How a site gets made, start to finish

1. **Plan it** with the `microsite-brief` skill: the page map and the differentiation plan come
   before any page exists.
2. **Create the site** in Studio (or open the existing one).
3. **Write each page.** As each page is drafted, run the `differentiation-audit` skill on it,
   while it is still cheap to fix. This is the single most important habit in this guide.
4. **Check the preview** as you go, and run the self-review checklist in
   `docs/CONTENT_STANDARDS.md` and the launch checklist in `docs/QA_CHECKLIST.md`.
5. **Clear the settings blockers** that are yours.
6. **Publish.** For a site that isn't live yet, tell Vic it's ready to launch.

### Getting Stuart ready to launch

Stuart launches Friday 9 October; Vic reviews on Tuesday 6 October. All of it is done in Studio:

1. **Site settings:** take *(Demo)* out of the brand name and *demo* out of the SEO title,
   description and keywords.
2. **Site settings → Service area:** one place per line: Stuart, Sewall's Point, Sailfish Point,
   Hutchinson Island, Palm City, Rocky Point, Martin County.
3. **Brand and logo:** the white logo in **Logo for dark backgrounds**.
4. **Home:** as in *Your first homepage*.
5. **Legal pages:** three pages titled exactly *Privacy Policy*, *Terms of Use* and *Disclaimer*;
   the footer links them by itself. Kevin approves the text before publishing (W-131).
6. **Delete the old test pages** *About this demo* and *Homeowners coverage, demo layout*.
7. **Before this site can go live** shows none of your items.
8. **Publish** and tell Vic Stuart is ready.

## Part 4 — Reference documents, and when to open each

| Document | Open it when... |
|---|---|
| `docs/CONTENT_STANDARDS.md` | You're writing a page. Always. The swap test, the AI rules, the self-review checklist |
| `docs/QA_CHECKLIST.md` | You think a page or a site is ready to publish |
| `docs/SITE_CONTENT_CHECKLIST.md` | You're starting a site, or checking how close one is to real: every setting and how many pages |
| `docs/ARCHITECTURE.md` | You want the decisions behind the factory and the reasons, once |
| `docs/QUALIFIED_CALL_DEFINITION.md` | You want to know what counts as a qualified call for Gate B |
| `BACKLOG.md` | You want to know what's built and what isn't yet |

## Part 5 — The rules that don't bend

1. **No site is built by hand.** It's generated from its settings and pages.
2. **The swap test is law.** If a page would still make sense with another city's name swapped
   in, it isn't done. Run `differentiation-audit` on every page.
3. **Everything is in English.**
4. **No AI-generated page ships.** AI can help you research or draft; you write what ships.
5. **Florida advertising rules and the site's name and phone apply to every page**, checked
   against the self-review checklist before you publish.

## Part 6 — Who to ask, and about what

- **Vic:** Studio, the template, errors, publishing problems, and anything this guide didn't
  answer. Your question goes into fixing the guide or Studio, not just into one answer.
- **Kevin:** brand assets, niches and domains, phone numbers, Google Business Profiles, and
  anything that is a business decision rather than a content or technical one.
