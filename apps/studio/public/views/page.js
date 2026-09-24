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

function fieldsForm(fields) {
  const types = Object.entries(text.pageTypes)
    .filter(([value]) => value !== "home" || fields.pageType === "home")
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
      <label class="check">
        <input id="field-showInNav" type="checkbox"${fields.showInNav ? " checked" : ""}>
        ${text.fieldShowInNav}
      </label>
    </section>`;
}

export function renderPage(site, page) {
  const liveLink = site.live
    ? `<a href="${esc(`https://${site.domain}${page.route}`)}" target="_blank" rel="noopener">${
      text.viewLivePage}</a>`
    : "";
  const editor = page.fields
    ? `${fieldsForm(page.fields)}
       <label class="field" for="content">
         <span class="label">${text.fieldBody}</span>
         <span class="hint">${text.fieldBodyHint}</span>
         <textarea id="content" spellcheck="true">${esc(page.body)}</textarea>
       </label>`
    : `<p class="status wait">${text.rawEditorNote}</p>
       <textarea id="content" spellcheck="true">${esc(page.text)}</textarea>`;
  return `
    <a class="back" href="${siteLink(site.slug)}" id="back">${esc(text.backToSite(site.brandName))}</a>
    <h1>${esc(page.fields?.title || page.path)}</h1>
    <p class="muted">${esc(text.pageAddress(page.route))} ${liveLink}</p>
    <p class="muted">${page.inDraft ? text.editingDraft : text.editingPublished}</p>
    ${editor}
    <div class="actions">
      <button type="button" id="save">${text.save}</button>
    </div>`;
}
