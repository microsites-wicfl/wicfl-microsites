import { esc, siteLink } from "../html.js";
import { text } from "../strings.js";

function field(id, label, hint, input) {
  return `
    <label class="field" for="${id}">
      <span class="label">${label}</span>
      ${input}
      ${hint ? `<span class="hint">${hint}</span>` : ""}
    </label>`;
}

export function fieldsForm(fields, { allowHome = true } = {}) {
  const types = Object.entries(text.pageTypes)
    .filter(([value]) => value !== "home" || (allowHome && fields.pageType === "home"))
    .map(([value, label]) =>
      `<option value="${value}"${value === fields.pageType ? " selected" : ""}>${label}</option>`)
    .join("");
  const locked = fields.pageType === "home" ? " disabled" : "";
  return `
    <section class="panel fields">
      ${field("field-title", text.fieldTitle,
        `${text.fieldTitleHint} <output id="count-title"></output>`,
        `<input id="field-title" type="text" value="${esc(fields.title)}" data-count="count-title">`)}
      ${field("field-description", text.fieldDescription,
        `${text.fieldDescriptionHint} <output id="count-description"></output>`,
        `<textarea id="field-description" class="short" data-count="count-description">${esc(
          fields.description)}</textarea>`)}
      <div class="row">
        ${field("field-navLabel", text.fieldNavLabel, text.fieldNavLabelHint,
          `<input id="field-navLabel" type="text" value="${esc(fields.navLabel)}">`)}
        ${field("field-pageType", text.fieldPageType, "",
          `<select id="field-pageType"${locked}>${types}</select>`)}
      </div>
      <div class="row">
        ${field("field-navOrder", text.fieldNavOrder, text.fieldNavOrderHint,
          `<input id="field-navOrder" type="number" min="0" max="999" step="1" inputmode="numeric"
            value="${esc(fields.navOrder ?? "")}">`)}
      </div>
      <label class="check">
        <input id="field-showInNav" type="checkbox"${fields.showInNav ? " checked" : ""}>
        ${text.fieldShowInNav}
      </label>
    </section>`;
}

export function imagesPanel() {
  return `
    <section class="panel images">
      <div class="section-head">
        <span class="label">${text.imagesTitle}</span>
        <label class="button small">${text.addImage}
          <input id="image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
        </label>
      </div>
      <p class="hint">${text.imagesHint}</p>
      <div id="image-list" class="thumbs"><p class="muted small">${text.imagesEmpty}</p></div>
    </section>`;
}

// Page sections Pavel can add: each button puts a skeleton where the cursor is (the hero, at the
// top). The icon names for the icon rows are listed with their pictures, folded away.
export function columnsPanel() {
  const blocks = [
    ["hero", text.blockHero],
    ["features", text.blockFeatures],
    ["features-dark", text.blockFeaturesDark],
    ["cards", text.blockCards],
    ["faq", text.blockFaq],
    ["areas", text.blockAreas],
    ["cta", text.blockCta],
  ];
  const blockButtons = blocks
    .map(([kind, label]) => `<button type="button" class="secondary small" data-block="${kind}">${label}</button>`)
    .join("");
  return `
    <section class="panel layouts">
      <div class="section-head">
        <span class="label">${text.sectionsTitle}</span>
      </div>
      <div class="buttons wrap">
        ${blockButtons}
        <button type="button" class="secondary small" data-columns="2">${text.twoColumns}</button>
        <button type="button" class="secondary small" data-columns="3">${text.threeColumns}</button>
      </div>
      <p class="hint">${text.sectionsHint}</p>
      <details class="icon-names">
        <summary>${text.iconNamesTitle}</summary>
        <div id="icon-list" class="icon-list"><p class="muted small">${text.iconNamesLoading}</p></div>
      </details>
    </section>`;
}

export function renderIconList(icons) {
  return Object.entries(icons)
    .map(([name, svg]) => `<span class="icon-name">${svg}<code>${esc(name)}</code></span>`)
    .join("");
}

export function renderImageList(slug, images) {
  if (!images.length) return `<p class="muted small">${text.imagesEmpty}</p>`;
  return images
    .map(
      (image) => `
      <figure class="thumb">
        <img src="/api/sites/${encodeURIComponent(slug)}/images/${encodeURIComponent(image.name)}" alt="">
        <figcaption>${esc(image.name)}</figcaption>
        <button type="button" class="secondary small" data-insert="${esc(image.url)}">${text.insert}</button>
        <button type="button" class="secondary small" data-beside="${esc(image.url)}">${text.withText}</button>
      </figure>`,
    )
    .join("");
}

export function renderPage(site, page) {
  const liveLink = site.live
    ? `<a href="${esc(`https://${site.domain}${page.route}`)}" target="_blank" rel="noopener">${
      text.viewLivePage}</a>`
    : "";
  const sitePreview =
    site.preview?.state === "ready" && site.preview.url
      ? `<a href="${esc(`${site.preview.url.replace(/\/$/, "")}${page.route}`)}" target="_blank" rel="noopener">${
        text.openInSitePreview}</a>`
      : "";
  const editor = page.fields
    ? `${fieldsForm(page.fields)}
       ${imagesPanel()}
       ${columnsPanel()}
       <div class="split">
         <label class="field" for="content">
           <span class="label">${text.fieldBody}</span>
           <span class="hint">${text.fieldBodyHint}</span>
           <textarea id="content" spellcheck="true">${esc(page.body)}</textarea>
         </label>
         <section class="field live">
           <span class="label">${text.livePreview}</span>
           <span class="hint">${text.livePreviewHint} ${sitePreview}</span>
           <article id="live-preview" class="rendered"></article>
         </section>
       </div>`
    : `<p class="status wait">${text.rawEditorNote}</p>
       <textarea id="content" spellcheck="true">${esc(page.text)}</textarea>`;
  return `
    <a class="back" href="${siteLink(site.slug)}" id="back">${esc(text.backToSite(site.brandName))}</a>
    <h1>${esc(page.fields?.title || page.path)}</h1>
    <p class="muted">${esc(text.pageAddress(page.route))} ${liveLink}</p>
    <p class="muted">${page.inDraft ? text.editingDraft : text.editingPublished}</p>
    ${editor}
    <div class="actions">
      ${page.protected ? "" : `<button type="button" class="danger" id="delete">${text.deletePage}</button>`}
      <button type="button" id="save">${text.save}</button>
    </div>`;
}

export function renderNewPage(site) {
  const blank = { title: "", description: "", navLabel: "", showInNav: true, pageType: "content", navOrder: "" };
  return `
    <a class="back" href="${siteLink(site.slug)}">${esc(text.backToSite(site.brandName))}</a>
    <h1>${text.newPageTitle}</h1>
    <p class="muted">${text.newPageHint} <output id="new-address"></output></p>
    ${fieldsForm(blank, { allowHome: false })}
    <label class="field" for="content">
      <span class="label">${text.fieldBody}</span>
      <span class="hint">${text.fieldBodyHint}</span>
      <textarea id="content" spellcheck="true"></textarea>
    </label>
    <div class="actions">
      <button type="button" id="create">${text.create}</button>
    </div>`;
}
