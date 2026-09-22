import { UserError } from "./errors.js";

// Cloudflare Access protects the Worker before any code runs; ctx.access exposes who signed in.
// https://developers.cloudflare.com/workers/configuration/cloudflare-access/
// ALLOWED_EMAILS is a second, independent check in case Access is ever switched off by mistake.
export async function requireUser(ctx, env) {
  const identity = await ctx?.access?.getIdentity?.();
  const email = identity?.email?.trim().toLowerCase();
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
