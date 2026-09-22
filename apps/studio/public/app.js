import { text } from "./strings.js";

const app = document.querySelector("#app");
const user = document.querySelector("#user");
const dialog = document.querySelector("#discard");
let slug = "";

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

async function api(path, init) {
  const response = await fetch(`/api${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error);
  return body;
}

async function showPage(path) {
  const data = await api(`/sites/${slug}/pages/${path}`);
  app.innerHTML = `<button id="back">${text.back}</button><h2>${esc(path)}</h2><textarea id="content">${esc(data.text)}</textarea><p><button id="save">${text.save}</button></p>`;
  document.querySelector("#back").onclick = () => { location.hash = `#/sitio/${slug}`; };
  document.querySelector("#save").onclick = async () => {
    await api(`/sites/${slug}/pages/${path}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: document.querySelector("#content").value }) });
    location.hash = `#/sitio/${slug}`;
  };
}

async function render() {
  try {
    user.textContent = (await api("/me")).email;
    const route = location.hash.split("/").filter(Boolean);
    if (!route.length) {
      const sites = await api("/sites");
      app.innerHTML = sites.length ? sites.map((site) => `<a class="card" href="#/sitio/${site.slug}"><b>${esc(site.brandName)}</b><br><span class="muted">${esc(site.domain)}</span><p class="tag">${site.changed ? text.draft : text.ready}</p></a>`).join("") : `<p>${text.empty}</p>`;
      return;
    }
    slug = route[1];
    if (route[2] === "pagina") return showPage(route.slice(3).join("/"));
    const site = await api(`/sites/${slug}`);
    const pages = site.pages.map((page) => {
      const path = page.path.replace(`sites/${slug}/content/`, "");
      return `<a class="card" href="#/sitio/${slug}/pagina/${path}">${esc(path)}${page.edited ? ` · ${text.edited}` : ""}</a>`;
    }).join("");
    app.innerHTML = `<button id="discardBtn">${text.discard}</button><h2>${esc(site.brandName)}</h2>${pages}`;
    document.querySelector("#discardBtn").onclick = () => dialog.showModal();
  } catch (error) { app.innerHTML = `<p>${esc(error.message || text.error)}</p>`; }
}

document.querySelector("[data-cancel]").onclick = () => dialog.close();
document.querySelector("[data-confirm]").onclick = async () => {
  await api(`/sites/${slug}/draft`, { method: "DELETE" });
  dialog.close();
  render();
};
addEventListener("hashchange", render);
render();
