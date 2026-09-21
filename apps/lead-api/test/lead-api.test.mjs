import assert from "node:assert/strict";
import test from "node:test";
import { createLeadApi } from "../src/core.js";

const env = {
  ALLOWED_ORIGINS: "https://preview.example.test",
  LEAD_SITES: JSON.stringify({ "stuart-homeowners": { leadSource: "stuart-homeowners", formId: "form-real", customFieldIds: { purchaseReason: "reason-field" } } }),
  GHL_API_TOKEN: "test-token",
  GHL_LOCATION_ID: "location-test",
  GOOGLE_PLACES_API_KEY: "test-key"
};
const request = (path, body) => new Request(`https://lead.example.test${path}`, { method: "POST", headers: { origin: "https://preview.example.test", "content-type": "application/json" }, body: JSON.stringify(body) });

test("first progressive save upserts the partial contact", async () => {
  const calls = [];
  const app = createLeadApi({ fetcher: async (url, init) => { calls.push({ url, init }); return Response.json({ new: true, contact: { id: "contact-123" } }); } });
  const response = await app(request("/v1/leads", { siteSlug: "stuart-homeowners", zip: "34994" }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).contactId, "contact-123");
  assert.match(calls[0].url, /contacts\/upsert$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { locationId: "location-test", postalCode: "34994", source: "stuart-homeowners" });
});

test("later save updates the returned contact id and maps configured custom fields", async () => {
  const calls = [];
  const app = createLeadApi({ fetcher: async (url, init) => { calls.push({ url, init }); return Response.json({ succeeded: true, contact: { id: "contact-123" } }); } });
  const response = await app(request("/v1/leads", { siteSlug: "stuart-homeowners", contactId: "contact-123", address: "10 Ocean Ave", purchaseReason: "New home" }), env);
  assert.equal(response.status, 200);
  assert.match(calls[0].url, /contacts\/contact-123$/);
  assert.deepEqual(JSON.parse(calls[0].init.body).customFields, [{ id: "reason-field", fieldValue: "New home" }]);
});

test("autocomplete is proxied and external outages produce a useful response", async () => {
  const app = createLeadApi({ fetcher: async () => new Response("no", { status: 503 }) });
  const response = await app(request("/v1/addresses", { input: "10 Ocean", sessionToken: "session-123" }), env);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /Address suggestions are unavailable/);
});

test("autocomplete returns only display-safe suggestion fields", async () => {
  const app = createLeadApi({ fetcher: async () => Response.json({ suggestions: [{ placePrediction: { placeId: "place-1", text: { text: "10 Ocean Ave, Stuart, FL" } } }] }) });
  const response = await app(request("/v1/addresses", { input: "10 Ocean", sessionToken: "session-123" }), env);
  assert.deepEqual(await response.json(), { suggestions: [{ placeId: "place-1", text: "10 Ocean Ave, Stuart, FL" }] });
});

test("rejects unsupported uploads before any R2 URL can be signed", async () => {
  const app = createLeadApi();
  const response = await app(request("/v1/uploads", { contactId: "contact-123", contentType: "application/exe", size: 100 }), env);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /PDF, JPEG, PNG, or WebP/);
});

test("generates a short-lived PUT URL with the permitted content type signed", async () => {
  const app = createLeadApi();
  const response = await app(request("/v1/uploads", { contactId: "contact-123", contentType: "application/pdf", size: 100 }), { ...env, R2_ACCOUNT_ID: "account-test", R2_BUCKET_NAME: "private-policies", R2_ACCESS_KEY_ID: "key-test", R2_SECRET_ACCESS_KEY: "secret-test" });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.expiresInSeconds, 300);
  assert.match(result.url, /X-Amz-Signature=/);
  assert.match(result.key, /^policy-declarations\/contact-123\//);
});
