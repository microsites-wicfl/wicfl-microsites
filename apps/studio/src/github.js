const decode = (value) => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\n/g, "")), (character) => character.charCodeAt(0)));
const encode = (value) => btoa(String.fromCharCode(...new TextEncoder().encode(value)));
export function repo(env) { return `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`; }
export async function api(env, path, init = {}, fetcher = fetch) {
  const response = await fetcher(`https://api.github.com${path}`, { ...init, headers: { accept: "application/vnd.github+json", authorization: `Bearer ${env.GITHUB_TOKEN}`, "user-agent": "wicfl-studio/1.0", "x-github-api-version": "2022-11-28", ...(init.headers || {}) } });
  if (!response.ok) { const error = new Error(`GitHub ${response.status}: ${await response.text()}`); error.status = response.status; throw error; }
  return response.status === 204 ? null : response.json();
}
export async function file(env, path, ref, fetcher) { const item = await api(env, `${repo(env)}/contents/${path}?ref=${encodeURIComponent(ref)}`, {}, fetcher); return { text: decode(item.content), sha: item.sha }; }
export { encode };
