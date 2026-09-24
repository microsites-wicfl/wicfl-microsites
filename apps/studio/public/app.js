import { api } from "./api.js";
import { $, esc, pageLink, siteLink } from "./html.js";
import { renderNewSite, renderSettings } from "./views/settings.js";
import { text } from "./strings.js";
import { confirmDialog, toast } from "./ui.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderMarkdown } from "./markdown.js";
import { renderImageList, renderNewPage, renderPage } from "./views/page.js";
import { renderSite } from "./views/site.js";

const app = $("#app");
const PREVIEW_REFRESH_MS = 15000;
let refreshTimer;
let unsavedEditor = null;

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] === "new-site") return { view: "new-site" };
  if (parts[0] !== "site" || !parts[1]) return { view: "dashboard" };
  if (parts[2] === "settings") return { view: "settings", slug: parts[1] };
  if (parts[2] === "new") return { view: "new", slug: parts[1] };
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
  const publish = $("#publish");
  if (publish) {
    publish.onclick = async () => {
      const sure = await confirmDialog({
        message: text.publishQuestion(site.live),
        yes: text.publish,
        no: text.cancel,
      });
      if (!sure) return;
      publish.disabled = true;
      publish.textContent = text.publishing;
      try {
        const result = await api.publish(slug);
        const message = result.deploying ? text.publishedLive : text.publishedNotLive;
        toast(result.needsVic ? text.publishedNeedsVic : message);
        render();
      } catch (error) {
        toast(error.message);
        publish.disabled = false;
        publish.textContent = text.publish;
      }
    };
  }
  for (const button of document.querySelectorAll("[data-restore]")) {
    button.onclick = async () => {
      button.disabled = true;
      try {
        await api.restorePage(slug, button.dataset.restore);
        toast(text.restored);
        render();
      } catch (error) {
        toast(error.message);
        button.disabled = false;
      }
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
  if (page.fields) {
    watchLivePreview(slug);
    wireImages(slug);
  }

  const deleteButton = $("#delete");
  if (deleteButton) {
    deleteButton.onclick = async () => {
      const { linkedFrom } = await api.links(slug, path);
      const warning = linkedFrom.length ? `\n\n${text.deleteLinked(linkedFrom.join(", "))}` : "";
      const sure = await confirmDialog({
        message: `${text.deleteQuestion}${warning}`,
        yes: text.deleteYes,
        no: text.cancel,
      });
      if (!sure) return;
      try {
        await api.deletePage(slug, path);
        unsavedEditor = null;
        toast(text.deleted);
        location.hash = siteLink(slug);
      } catch (error) {
        toast(error.message);
      }
    };
  }

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

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function showSettings(slug) {
  const [site, data] = await Promise.all([api.site(slug), api.settings(slug)]);
  app.innerHTML = renderSettings(site, data);
  const form = $("#settings");
  const initial = JSON.stringify(formValues(form));
  unsavedEditor = { isDirty: () => JSON.stringify(formValues(form)) !== initial };
  const button = $("#save-settings");
  button.onclick = async () => {
    button.disabled = true;
    button.textContent = text.saving;
    try {
      const result = await api.saveSettings(slug, formValues(form));
      unsavedEditor = null;
      toast(result.saved ? text.settingsSaved : text.noChanges);
      location.hash = siteLink(slug);
    } catch (error) {
      toast(error.message);
      button.disabled = false;
      button.textContent = text.save;
    }
  };
}

function showNewSite() {
  app.innerHTML = renderNewSite();
  const form = $("#new-site");
  const initial = JSON.stringify(formValues(form));
  unsavedEditor = { isDirty: () => JSON.stringify(formValues(form)) !== initial };
  const button = $("#create-site");
  button.onclick = async () => {
    button.disabled = true;
    button.textContent = text.creating;
    try {
      const result = await api.createSite(formValues(form));
      unsavedEditor = null;
      toast(text.siteCreated);
      location.hash = siteLink(result.slug);
    } catch (error) {
      toast(error.message);
      button.disabled = false;
      button.textContent = text.createSite;
    }
  };
}

async function showNewPage(slug) {
  const site = await api.site(slug);
  app.innerHTML = renderNewPage(site);
  const address = $("#new-address");
  const title = $("#field-title");
  const updateAddress = () => {
    const name = title.value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "");
    address.textContent = name ? text.newPageAddress(`/${name}/`) : "";
  };
  title.addEventListener("input", updateAddress);
  watchCounters();
  const initial = JSON.stringify(readFields());
  unsavedEditor = { isDirty: () => JSON.stringify(readFields()) !== initial };

  const button = $("#create");
  button.onclick = async () => {
    button.disabled = true;
    button.textContent = text.creating;
    try {
      const { fields, body } = readFields();
      const result = await api.createPage(slug, { fields, body: body.trim() ? body : undefined });
      unsavedEditor = null;
      toast(text.created);
      location.hash = pageLink(slug, result.path);
    } catch (error) {
      toast(error.message);
      button.disabled = false;
      button.textContent = text.create;
    }
  };
}

// Images shown in the live preview come through Studio, so drafts' new images show before publishing.
function watchLivePreview(slug) {
  const editor = $("#content");
  const output = $("#live-preview");
  const resolve = (url) =>
    url.startsWith("/images/") ? `/api/sites/${encodeURIComponent(slug)}/images/${url.slice(8)}` : url;
  const update = () => {
    output.innerHTML = renderMarkdown(editor.value, resolve);
  };
  editor.addEventListener("input", update);
  update();
}

function insertAtCursor(textarea, snippet) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  textarea.value = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
  textarea.focus();
  textarea.dispatchEvent(new Event("input"));
}

async function wireImages(slug) {
  const list = $("#image-list");
  const show = (images) => {
    list.innerHTML = renderImageList(slug, images);
    for (const button of list.querySelectorAll("[data-insert]")) {
      button.onclick = () => insertAtCursor($("#content"), `\n\n![${text.imageAlt}](${button.dataset.insert})\n\n`);
    }
  };
  show(await api.images(slug).catch(() => []));

  const input = $("#image-file");
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const label = input.parentElement;
    label.classList.add("busy");
    toast(text.uploading);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const image = await api.uploadImage(slug, file.name, data);
      toast(text.uploaded);
      show(await api.images(slug));
      insertAtCursor($("#content"), `\n\n![${text.imageAlt}](${image.url})\n\n`);
    } catch (error) {
      toast(error.message);
    } finally {
      label.classList.remove("busy");
      input.value = "";
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
    if (route.view === "new") await showNewPage(route.slug);
    if (route.view === "settings") await showSettings(route.slug);
    if (route.view === "new-site") showNewSite();
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
