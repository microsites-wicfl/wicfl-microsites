import { esc, pageLink } from "../html.js";
import { text } from "../strings.js";

function previewPanel(preview) {
  const link = (label) =>
    `<a class="button" href="${esc(preview.url)}" target="_blank" rel="noopener">${label}</a>`;
  switch (preview.state) {
    case "ready":
      return `<p class="status ok">${text.previewReady}</p>${link(text.previewOpen)}`;
    case "failed":
      return `
        <p class="status bad">${text.previewFailed}</p>
        <p>${esc(preview.help || text.previewFailedHelp)}</p>
        <p class="muted small">${text.previewFailedDetails}</p>
        <pre class="reason">${esc(preview.reason)}</pre>
        ${preview.url ? link(text.previewPrevious) : ""}`;
    case "preparing":
      return `<p class="status wait">${text.previewPreparing}</p>${preview.url ? link(text.previewPrevious) : ""}`;
    default:
      return `<p class="muted">${text.previewNone}</p>`;
  }
}

function pageRow(site, page) {
  const badge = page.edited ? `<span class="badge warn">${text.edited}</span>` : "";
  const live = site.live
    ? `<a class="small" href="${esc(`https://${site.domain}${page.route}`)}" target="_blank" rel="noopener">${
      text.viewLive}</a>`
    : "";
  return `
    <div class="card page-row">
      <a class="page-link" href="${pageLink(site.slug, page.path)}">
        <strong>${esc(page.route)}</strong> <span class="muted small">${esc(page.path)}</span>
      </a>
      <span class="badges">${badge}${live}</span>
    </div>`;
}

export function renderSite(site) {
  const pages = site.pages.length
    ? site.pages.map((page) => pageRow(site, page)).join("")
    : `<p class="muted">${text.noPages}</p>`;
  const hasDraft = site.preview.state !== "none";
  return `
    <a class="back" href="#/">${text.allSites}</a>
    <h1>${esc(site.brandName)}</h1>
    <p class="muted">
      ${site.live
        ? `${text.liveAt("")}<a href="${esc(site.liveUrl)}" target="_blank" rel="noopener">${esc(site.domain)}</a>`
        : `${esc(site.domain)} · ${text.notLive}`}
    </p>
    <section class="panel">
      <h2>${text.previewTitle}</h2>
      ${previewPanel(site.preview)}
      ${hasDraft ? `<p class="muted small">${text.publishSoon}</p>` : ""}
      ${hasDraft ? `<button type="button" class="danger" id="discard">${text.discardDraft}</button>` : ""}
    </section>
    <h2>${text.pagesTitle}</h2>
    <div class="list">${pages}</div>`;
}
