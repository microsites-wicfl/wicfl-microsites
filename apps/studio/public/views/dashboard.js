import { esc, siteLink } from "../html.js";
import { text } from "../strings.js";

function siteCard(site) {
  const publishing = site.live ? text.liveAt(site.domain) : text.notLive;
  const changes = site.hasChanges
    ? `<span class="badge warn">${text.hasChanges}</span>`
    : `<span class="badge ok">${text.upToDate}</span>`;
  return `
    <a class="card site-card" href="${siteLink(site.slug)}">
      <strong>${esc(site.brandName)}</strong>
      <span class="muted">${esc(site.domain)}</span>
      <span class="badges">${changes}<span class="badge${site.live ? " ok" : ""}">${esc(publishing)}</span></span>
    </a>`;
}

export function renderDashboard(sites) {
  const real = sites.filter((site) => !site.isTest);
  const practice = sites.filter((site) => site.isTest);
  const realList = real.length ? real.map(siteCard).join("") : `<p class="muted">${text.dashboardEmpty}</p>`;
  const practiceSection = practice.length
    ? `<section class="practice">
         <h2>${text.testSites}</h2>
         <p class="muted">${text.testSitesHint}</p>
         <div class="grid">${practice.map(siteCard).join("")}</div>
       </section>`
    : "";
  return `
    <h1>${text.dashboardTitle}</h1>
    <div class="grid">${realList}</div>
    ${practiceSection}`;
}
