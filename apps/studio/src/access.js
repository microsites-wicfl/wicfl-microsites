import { UserError } from "./errors.js";

// Cloudflare Access protects the whole Worker before any code runs. This file answers "who signed in".
//
// Two sources, in order:
// 1. ctx.access.getIdentity(): what Cloudflare documents for Workers behind Access. It is what
//    `wrangler dev` simulates (see "access.dev" in wrangler.jsonc). But Workers with Static Assets
//    run behind an internal router that does NOT pass ctx.access along, so in production it is empty.
//    https://developers.cloudflare.com/workers/configuration/cloudflare-access/
// 2. The Access token (JWT) that Access attaches to every request it lets through, in the
//    Cf-Access-Jwt-Assertion header (or the CF_Authorization cookie). We verify its signature
//    against the team's public keys, its audience (ACCESS_AUD) and issuer (ACCESS_TEAM_DOMAIN),
//    and its expiry, then read the email from it.
//
// ALLOWED_EMAILS is a second, independent check in case Access is ever switched off by mistake.
export async function requireUser(request, ctx, env, fetcher = fetch) {
  const email = (await identityEmail(request, ctx, env, fetcher))?.trim().toLowerCase();
  if (!email) throw new UserError("Tienes que iniciar sesión para usar Studio.", 401);

  const allowed = (env.ALLOWED_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length > 0 && !allowed.includes(email)) {
    throw new UserError("Tu cuenta no tiene acceso a Studio. Pídele acceso a Vic.", 403);
  }
  return { email };
}

async function identityEmail(request, ctx, env, fetcher) {
  const fromContext = await ctx?.access?.getIdentity?.();
  if (fromContext?.email) return fromContext.email;

  const token = request.headers.get("cf-access-jwt-assertion") || cookie(request, "CF_Authorization");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const claims = await verifyAccessToken(token, env, fetcher);
  return typeof claims?.email === "string" ? claims.email : null;
}

function cookie(request, name) {
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

const CLOCK_SKEW_SECONDS = 60;
const KEYS_MAX_AGE_MS = 60 * 60 * 1000;
let keyCache = { url: null, keys: [], fetchedAt: 0 };

// Test hook: forget cached public keys.
export function resetAccessKeyCache() {
  keyCache = { url: null, keys: [], fetchedAt: 0 };
}

// Returns the token's claims when it is valid for this application, otherwise null.
export async function verifyAccessToken(token, env, fetcher = fetch, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const header = decodeJson(parts[0]);
  const claims = decodeJson(parts[1]);
  if (!header || !claims || header.alg !== "RS256" || !header.kid) return null;

  const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/+$/, "");
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const seconds = Math.floor(now / 1000);
  if (claims.iss !== issuer) return null;
  if (!audience.includes(env.ACCESS_AUD)) return null;
  if (typeof claims.exp !== "number" || claims.exp + CLOCK_SKEW_SECONDS < seconds) return null;
  if (typeof claims.nbf === "number" && claims.nbf - CLOCK_SKEW_SECONDS > seconds) return null;

  const jwk = await publicKey(issuer, header.kid, fetcher, now);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlBytes(parts[2]);
  if (!signature) return null;
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signed);
  return valid ? claims : null;
}

async function publicKey(issuer, kid, fetcher, now) {
  const url = `${issuer}/cdn-cgi/access/certs`;
  const fresh = keyCache.url === url && now - keyCache.fetchedAt < KEYS_MAX_AGE_MS;
  let found = fresh ? keyCache.keys.find((key) => key.kid === kid) : null;
  if (found) return found;

  // Unknown key or stale cache: Access rotates keys, so fetch them again once.
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Access public keys: HTTP ${response.status}`);
  const body = await response.json();
  keyCache = { url, keys: Array.isArray(body.keys) ? body.keys : [], fetchedAt: now };
  found = keyCache.keys.find((key) => key.kid === kid);
  return found || null;
}

function base64UrlBytes(value) {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function decodeJson(value) {
  const bytes = base64UrlBytes(value);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
