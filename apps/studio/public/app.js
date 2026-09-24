import { api } from "./api.js";
import { $, esc, siteLink } from "./html.js";
import { text } from "./strings.js";
import { confirmDialog, toast } from "./ui.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderPage } from "./views/page.js";
import { renderSite } from "./views/site.js";

const app = $("#app");
const PREVIEW_REFRESH_MS = 15000;
let refreshTimer;
let unsavedEditor = null;

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] !== "site" || !parts[1]) return { view: "dashboard" };
  if (parts[2] === "page" && parts.length > 3) {
    return { view: "page", slug: parts[1], path: parts.slice(3).join("/") };
  }
  return { view: "site", slug: parts[1] };
}

function showError(error) {
  app.innerHTML = `
    <div class="panel">
      <p class="status bad">${esc(error.message || text.genericError)}</p>
      <button type="button" id="retry">${text.retry}</button>
    </div>`;
  $("#retry").onclick = render;
}

async function showSite(slug) {
  const site = await api.site(slug);
  app.innerHTML = renderSite(site);
  const discard = $("#discard");
  if (discard) {
    discard.onclick = async () => {
      const sure = await confirmDialog({
        message: text.discardQuestion,
        yes: text.discardYes,
        no: text.cancel,
      });
      if (!sure) return;
      await api.discardDraft(slug);
      toast(text.discarded);
      render();
    };
  }
  if (site.preview.state === "preparing") {
    refreshTimer = setTimeout(() => {
      if (parseRoute().view === "site") render();
    }, PREVIEW_REFRESH_MS);
  }
}

async function showPage(slug, path) {
  const [site, page] = await Promise.all([api.site(slug), api.page(slug, path)]);
  app.innerHTML = renderPage(site, page);
  const saveButton = $("#save");
  const payload = () => (page.fields ? readFields() : { content: $("#content").value });
  const initial = JSON.stringify(payload());
  unsavedEditor = { isDirty: () => JSON.stringify(payload()) !== initial };
  watchCounters();

  saveButton.onclick = async () => {
    saveButton.disabled = true;
    saveButton.textContent = text.saving;
    try {
      const result = await api.savePage(slug, path, payload());
      unsavedEditor = null;
      toast(result.saved ? text.saved : text.noChanges);
      location.hash = siteLink(slug);
    } catch (error) {
      toast(error.message);
      saveButton.disabled = false;
      saveButton.textContent = text.save;
    }
  };
}

function readFields() {
  return {
    fields: {
      title: $("#field-title").value,
      description: $("#field-description").value,
      navLabel: $("#field-navLabel").value,
      showInNav: $("#field-showInNav").checked,
      pageType: $("#field-pageType").value,
    },
    body: $("#content").value,
  };
}

// Live character counts under the title and description, so length guidance is visible as he types.
function watchCounters() {
  for (const input of document.querySelectorAll("[data-count]")) {
    const output = $(`#${input.dataset.count}`);
    const update = () => {
      output.textContent = text.characters(input.value.length);
    };
    input.addEventListener("input", update);
    update();
  }
}

async function render() {
  clearTimeout(refreshTimer);
  const route = parseRoute();
  app.innerHTML = `<p class="muted">${text.loading}</p>`;
  try {
    if (route.view === "dashboard") app.innerHTML = renderDashboard(await api.sites());
    if (route.view === "site") await showSite(route.slug);
    if (route.view === "page") await showPage(route.slug, route.path);
  } catch (error) {
    showError(error);
  }
}

// Leaving a page with unsaved edits asks first, inside the app and when closing the tab.
let lastHash = location.hash;
addEventListener("hashchange", async () => {
  if (unsavedEditor?.isDirty()) {
    const leave = await confirmDialog({ message: text.unsavedQuestion, yes: text.leave, no: text.stay });
    if (!leave) {
      history.replaceState(null, "", lastHash);
      return;
    }
  }
  unsavedEditor = null;
  lastHash = location.hash;
  render();
});
addEventListener("beforeunload", (event) => {
  if (unsavedEditor?.isDirty()) event.preventDefault();
});

api
  .me()
  .then((me) => {
    $("#user").textContent = me.email;
  })
  .catch(() => {});
render();
