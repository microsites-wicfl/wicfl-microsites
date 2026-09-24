// Whether a site is actually live on its own domain. Being listed in a pod only means it is wired
// for production; before launch the domain may still show nothing, or someone else's page. So we
// ask the domain itself: live means it answers with a page whose canonical address is that domain.
const TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 3000;
const cache = new Map();

export function resetLiveCache() {
  cache.clear();
}

export async function isLive(domain, fetcher, now = Date.now()) {
  if (!domain || !fetcher) return false;
  const hit = cache.get(domain);
  if (hit && now - hit.at < TTL_MS) return hit.live;

  let live = false;
  try {
    const response = await fetcher(`https://${domain}/`, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) {
      const html = await response.text();
      live = html.includes('rel="canonical"') && html.includes(`href="https://${domain}/"`);
    }
  } catch {
    live = false;
  }
  cache.set(domain, { live, at: now });
  return live;
}
