// Focused standalone check for the generated pod router. It prevents an alias from being added
// to pods/<pod>.json without proving it selects the intended site's assets.
const worker = await import(new URL("../dist/pods/pod-1/worker.mjs", import.meta.url).href);
const fetchedPaths = [];
const env = {
  ASSETS: {
    fetch(request) {
      fetchedPaths.push(new URL(request.url).pathname);
      return new Response("Stuart rehearsal site", { status: 200 });
    }
  },
  WICFL_REHEARSAL: "1"
};

const aliasResponse = await worker.default.fetch(new Request("https://preview.stuarthomeownersinsurance.com/flood-insurance/"), env);
if (aliasResponse.status !== 200 || fetchedPaths[0] !== "/stuart-homeowners/flood-insurance/" || aliasResponse.headers.get("X-Robots-Tag") !== "noindex, nofollow") {
  throw new Error("Preview alias did not resolve to Stuart with the rehearsal noindex header.");
}

const unknownResponse = await worker.default.fetch(new Request("https://nobody.example/"), env);
if (unknownResponse.status !== 404) {
  throw new Error("An unknown host must return 404.");
}

console.log("Pod router rehearsal checks passed: preview alias -> Stuart; unknown host -> 404.");
