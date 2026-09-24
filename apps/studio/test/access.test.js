import assert from "node:assert/strict";
import test from "node:test";
import { requireUser, resetAccessKeyCache, verifyAccessToken } from "../src/access.js";
import { createHandler } from "../src/index.js";
import { env as baseEnv, offline, sampleRepository } from "./fake-github.js";

const TEAM = "https://team.cloudflareaccess.com";
const AUD = "studio-aud-tag";
const env = { ...baseEnv, ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD };

const pair = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["sign", "verify"],
);
const publicJwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "key-1" };
const other = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true,
  ["sign", "verify"],
);

function b64url(bytes) {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(claims, { kid = "key-1", privateKey = pair.privateKey } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(Buffer.from(JSON.stringify({ alg: "RS256", kid, typ: "JWT" })));
  const body = b64url(
    Buffer.from(JSON.stringify({ iss: TEAM, aud: [AUD], exp: now + 3600, iat: now, nbf: now, ...claims })),
  );
  const signed = new TextEncoder().encode(`${header}.${body}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, signed);
  return `${header}.${body}.${b64url(new Uint8Array(signature))}`;
}

function keyServer() {
  const server = async (url) => {
    server.calls.push(String(url));
    if (String(url) !== `${TEAM}/cdn-cgi/access/certs`) return new Response("not found", { status: 404 });
    return Response.json({ keys: [publicJwk] });
  };
  server.calls = [];
  return server;
}

function request(headers = {}) {
  return new Request("https://studio.test/api/me", { headers });
}

test("a valid Access token in the header identifies the user when ctx.access is empty", async () => {
  resetAccessKeyCache();
  const token = await sign({ email: "Vic@Example.test" });
  const user = await requireUser(request({ "cf-access-jwt-assertion": token }), {}, env, keyServer());
  assert.deepEqual(user, { email: "vic@example.test" });
});

test("the CF_Authorization cookie works when the header is missing", async () => {
  resetAccessKeyCache();
  const token = await sign({ email: "vic@example.test" });
  const user = await requireUser(request({ cookie: `other=1; CF_Authorization=${token}` }), {}, env, keyServer());
  assert.equal(user.email, "vic@example.test");
});

test("ctx.access, when present, wins and needs no key download", async () => {
  const keys = keyServer();
  const ctx = { access: { getIdentity: async () => ({ email: "vic@example.test" }) } };
  const user = await requireUser(request(), ctx, env, keys);
  assert.equal(user.email, "vic@example.test");
  assert.equal(keys.calls.length, 0);
});

for (const [name, claims, options] of [
  ["wrong audience", { email: "vic@example.test", aud: ["another-app"] }],
  ["wrong issuer", { email: "vic@example.test", iss: "https://evil.cloudflareaccess.com" }],
  ["expired", { email: "vic@example.test", exp: Math.floor(Date.now() / 1000) - 3600 }],
  ["not yet valid", { email: "vic@example.test", nbf: Math.floor(Date.now() / 1000) + 3600 }],
  ["signed by another key", { email: "vic@example.test" }, { privateKey: other.privateKey }],
  ["unknown key id", { email: "vic@example.test" }, { kid: "key-9" }],
]) {
  test(`a token with ${name} is rejected with 401`, async () => {
    resetAccessKeyCache();
    const token = await sign(claims, options);
    await assert.rejects(
      requireUser(request({ "cf-access-jwt-assertion": token }), {}, env, keyServer()),
      (error) => error.status === 401,
    );
  });
}

test("a tampered payload is rejected", async () => {
  resetAccessKeyCache();
  const [header, , signature] = (await sign({ email: "vic@example.test" })).split(".");
  const claims = { iss: TEAM, aud: [AUD], exp: 9999999999, email: "vic@example.test" };
  const forged = b64url(Buffer.from(JSON.stringify(claims)));
  assert.equal(await verifyAccessToken(`${header}.${forged}.${signature}`, env, keyServer()), null);
});

test("garbage tokens are rejected without throwing", async () => {
  resetAccessKeyCache();
  for (const token of ["", "abc", "a.b.c", "....", "x.y"]) {
    assert.equal(await verifyAccessToken(token, env, keyServer()), null);
  }
});

test("without ACCESS_TEAM_DOMAIN / ACCESS_AUD a token is ignored (fails closed)", async () => {
  resetAccessKeyCache();
  const token = await sign({ email: "vic@example.test" });
  await assert.rejects(
    requireUser(request({ "cf-access-jwt-assertion": token }), {}, baseEnv, keyServer()),
    (error) => error.status === 401,
  );
});

test("a valid token for an email outside ALLOWED_EMAILS answers 403", async () => {
  resetAccessKeyCache();
  const token = await sign({ email: "someone@else.test" });
  await assert.rejects(
    requireUser(request({ "cf-access-jwt-assertion": token }), {}, env, keyServer()),
    (error) => error.status === 403,
  );
});

test("public keys are cached between requests", async () => {
  resetAccessKeyCache();
  const keys = keyServer();
  const token = await sign({ email: "vic@example.test" });
  await requireUser(request({ "cf-access-jwt-assertion": token }), {}, env, keys);
  await requireUser(request({ "cf-access-jwt-assertion": token }), {}, env, keys);
  assert.equal(keys.calls.length, 1);
});

test("end to end: /api/me answers with the email from the Access token", async () => {
  resetAccessKeyCache();
  const handle = createHandler(sampleRepository().fetch, keyServer(), offline);
  const token = await sign({ email: "vic@example.test" });
  const response = await handle(request({ "cf-access-jwt-assertion": token }), env, {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { email: "vic@example.test" });
});
