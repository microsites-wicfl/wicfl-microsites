import { AwsClient } from "aws4fetch";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { ...JSON_HEADERS, ...headers } });
const error = (message, status = 400, headers = {}) => json({ error: message }, status, headers);
const asObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : null;

function allowedOrigin(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  return (env.ALLOWED_ORIGINS ?? "").split(",").map((value) => value.trim()).includes(origin) ? origin : null;
}

function cors(request, env) {
  const origin = allowedOrigin(request, env);
  return origin ? { "access-control-allow-origin": origin, vary: "Origin", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" } : {};
}

function configuredSites(env) {
  try {
    const sites = JSON.parse(env.LEAD_SITES ?? "{}");
    return asObject(sites) ?? {};
  } catch {
    return {};
  }
}

function requireSite(body, env) {
  const sites = configuredSites(env);
  const site = typeof body.siteSlug === "string" ? sites[body.siteSlug] : null;
  if (!asObject(site)) throw new Error("Lead capture is not configured for this site yet.");
  return site;
}

function contactPayload(body, site) {
  const customFieldIds = asObject(site.customFieldIds) ?? {};
  const fields = [
    ["purchaseReason", body.purchaseReason],
    ["timing", body.timing],
    ["currentInsurer", body.currentInsurer],
    ["annualPremium", body.annualPremium]
  ].flatMap(([name, value]) => typeof value === "string" && value.trim() && typeof customFieldIds[name] === "string"
    ? [{ id: customFieldIds[name], fieldValue: value.trim() }]
    : []);
  return {
    ...(typeof body.firstName === "string" ? { firstName: body.firstName.trim() } : {}),
    ...(typeof body.lastName === "string" ? { lastName: body.lastName.trim() } : {}),
    ...(typeof body.email === "string" ? { email: body.email.trim() } : {}),
    ...(typeof body.phone === "string" ? { phone: body.phone.trim() } : {}),
    ...(typeof body.address === "string" ? { address1: body.address.trim() } : {}),
    ...(typeof body.zip === "string" ? { postalCode: body.zip.trim() } : {}),
    source: site.leadSource,
    ...(fields.length ? { customFields: fields } : {})
  };
}

async function ghlRequest(fetcher, env, path, init) {
  if (!env.GHL_API_TOKEN || !env.GHL_LOCATION_ID) throw new Error("CRM_SERVICE_UNAVAILABLE");
  const response = await fetcher(`https://services.leadconnectorhq.com${path}`, {
    ...init,
    headers: { authorization: `Bearer ${env.GHL_API_TOKEN}`, version: "2021-07-28", "content-type": "application/json" }
  });
  if (!response.ok) throw new Error("CRM_SERVICE_UNAVAILABLE");
  return response.json();
}

async function saveLead(body, env, fetcher) {
  const site = requireSite(body, env);
  const payload = contactPayload(body, site);
  const contact = body.contactId
    ? await ghlRequest(fetcher, env, `/contacts/${encodeURIComponent(body.contactId)}`, { method: "PUT", body: JSON.stringify(payload) })
    : await ghlRequest(fetcher, env, "/contacts/upsert", { method: "POST", body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, ...payload }) });
  const contactId = contact.contact?.id;
  if (typeof contactId !== "string" || !contactId) throw new Error("CRM_SERVICE_UNAVAILABLE");
  return { contactId, uploadEligible: Boolean(body.email || body.phone), formId: site.formId };
}

async function autocomplete(body, env, fetcher) {
  if (!env.GOOGLE_PLACES_API_KEY) throw new Error("ADDRESS_SERVICE_UNAVAILABLE");
  if (typeof body.input !== "string" || body.input.trim().length < 3) return { suggestions: [] };
  const response = await fetcher("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.GOOGLE_PLACES_API_KEY },
    body: JSON.stringify({ input: body.input.trim(), includedRegionCodes: ["us"], sessionToken: body.sessionToken })
  });
  if (!response.ok) throw new Error("ADDRESS_SERVICE_UNAVAILABLE");
  const data = await response.json();
  return { suggestions: (data.suggestions ?? []).flatMap((item) => item.placePrediction?.text?.text ? [{ placeId: item.placePrediction.placeId, text: item.placePrediction.text.text }] : []) };
}

async function uploadUrl(body, env) {
  if (typeof body.contactId !== "string" || !/^[A-Za-z0-9_-]{6,}$/.test(body.contactId)) throw new Error("Invalid lead session.");
  if (!ALLOWED_CONTENT_TYPES.has(body.contentType) || !Number.isFinite(body.size) || body.size < 1 || body.size > MAX_FILE_SIZE) throw new Error("Upload a PDF, JPEG, PNG, or WebP file under 10 MB.");
  if (!env.R2_ACCOUNT_ID || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) throw new Error("UPLOAD_SERVICE_UNAVAILABLE");
  const extension = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[body.contentType];
  const key = `policy-declarations/${body.contactId}/${crypto.randomUUID()}.${extension}`;
  const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`;
  const client = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" });
  const signed = await client.sign(new Request(endpoint, { method: "PUT", headers: { "content-type": body.contentType } }), { aws: { signQuery: true, allHeaders: true, expires: 300 } });
  return { url: signed.url, key, expiresInSeconds: 300, contentType: body.contentType };
}

export function createLeadApi({ fetcher = fetch } = {}) {
  return async function fetch(request, env) {
    const headers = cors(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: allowedOrigin(request, env) ? 204 : 403, headers });
    if (!allowedOrigin(request, env)) return error("This site is not allowed to use lead capture.", 403, headers);
    if (request.method !== "POST") return error("Not found.", 404, headers);
    let body;
    try { body = asObject(await request.json()); } catch { return error("Invalid request.", 400, headers); }
    if (!body) return error("Invalid request.", 400, headers);
    try {
      const path = new URL(request.url).pathname;
      if (path === "/v1/leads") return json(await saveLead(body, env, fetcher), 200, headers);
      if (path === "/v1/addresses") return json(await autocomplete(body, env, fetcher), 200, headers);
      if (path === "/v1/uploads") return json(await uploadUrl(body, env), 200, headers);
      return error("Not found.", 404, headers);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "LEAD_SERVICE_UNAVAILABLE";
      const publicMessage = message === "CRM_SERVICE_UNAVAILABLE" ? "We could not save your progress right now. Please try again shortly."
        : message === "ADDRESS_SERVICE_UNAVAILABLE" ? "Address suggestions are unavailable. You can still enter your address manually."
        : message === "UPLOAD_SERVICE_UNAVAILABLE" ? "Document upload is not available yet. You can still request your quote."
        : message;
      return error(publicMessage, message.includes("UNAVAILABLE") ? 503 : 400, headers);
    }
  };
}
