import { esc, siteLink } from "../html.js";
import { text } from "../strings.js";

const PRODUCTS = [
  "homeowners", "flood", "windstorm", "condo", "renters", "landlord", "umbrella", "contractor",
  "commercial-property", "general-liability",
];
const AUDIENCES = ["homeowner", "condo-owner", "renter", "landlord", "contractor", "business-owner"];
const PROOF_TYPES = ["market-data", "local-regulation", "case-experience", "community-partnership", "review"];
const pretty = (value) => value.replace(/-/g, " ").replace(/^./, (letter) => letter.toUpperCase());

function input(name, value = "", { multiline = false, type = "text" } = {}) {
  const [label, hint] = text.fields[name];
  const control = multiline
    ? `<textarea id="f-${name}" name="${name}" class="short">${esc(value)}</textarea>`
    : `<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}">`;
  return `
    <label class="field" for="f-${name}">
      <span class="label">${label}</span>
      ${control}
      ${hint ? `<span class="hint">${hint}</span>` : ""}
    </label>`;
}

function choice(name, options, value) {
  const [label] = text.fields[name];
  const items = options
    .map((option) => `<option value="${option}"${option === value ? " selected" : ""}>${pretty(option)}</option>`)
    .join("");
  return `
    <label class="field" for="f-${name}">
      <span class="label">${label}</span>
      <select id="f-${name}" name="${name}">${items}</select>
    </label>`;
}

export function blockersPanel(blockers) {
  const items = blockers.length
    ? `<ul>${blockers.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
    : `<p class="status ok">${text.blockersNone}</p>`;
  return `<section class="panel blockers"><h2>${text.blockersTitle}</h2>${items}</section>`;
}

export function renderSettings(site, data) {
  const values = data.settings;
  return `
    <a class="back" href="${siteLink(site.slug)}">${esc(text.backToSite(site.brandName))}</a>
    <h1>${text.settingsTitle}</h1>
    ${site.isTest ? "" : blockersPanel(data.blockers)}
    <form id="settings" class="panel fields">
      ${input("brandName", values.brandName)}
      <div class="row">${input("phone", values.phone)}${input("email", values.email, { type: "email" })}</div>
      ${input("seoTitle", values.seoTitle)}
      ${input("seoDescription", values.seoDescription, { multiline: true })}
      ${input("primaryKeyword", values.primaryKeyword)}
      <div class="row">
        ${input("secondaryKeywords", values.secondaryKeywords, { multiline: true })}
        ${input("serviceArea", values.serviceArea, { multiline: true })}
      </div>
    </form>
    <div class="actions"><button type="button" id="save-settings">${text.save}</button></div>`;
}

export function renderNewSite() {
  return `
    <a class="back" href="#/">${text.allSites}</a>
    <h1>${text.newSiteTitle}</h1>
    <p class="muted">${text.newSiteHint}</p>
    <form id="new-site" class="panel fields">
      <div class="row">${input("brandName")}${input("domain")}</div>
      <div class="row">${input("city")}${input("county")}</div>
      <div class="row">${choice("product", PRODUCTS, "homeowners")}${choice("audience", AUDIENCES, "homeowner")}</div>
      ${input("serviceArea", "", { multiline: true })}
      ${input("seoTitle")}
      ${input("seoDescription", "", { multiline: true })}
      ${input("primaryKeyword")}
      <div class="row">${choice("proofType", PROOF_TYPES, "market-data")}<span></span></div>
      ${input("proofSummary", "", { multiline: true })}
      ${input("sectionTitle")}
      ${input("sectionRationale", "", { multiline: true })}
    </form>
    <div class="actions"><button type="button" id="create-site">${text.createSite}</button></div>`;
}
