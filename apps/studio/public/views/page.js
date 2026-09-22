import { esc, siteLink } from "../html.js";
import { text } from "../strings.js";

export function renderPage(site, page) {
  return `
    <a class="back" href="${siteLink(site.slug)}" id="back">${esc(text.backToSite(site.brandName))}</a>
    <h1>${esc(page.path)}</h1>
    <p class="muted">${page.inDraft ? text.editingDraft : text.editingPublished}</p>
    <textarea id="content" spellcheck="true">${esc(page.text)}</textarea>
    <div class="actions">
      <button type="button" id="save">${text.save}</button>
    </div>`;
}
