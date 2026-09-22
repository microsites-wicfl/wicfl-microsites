export async function identity(ctx, env) {
  const user = await ctx?.access?.getIdentity?.();
  if (!user?.email) return { error: 401, message: "Acceso no autorizado." };
  const allowed = env.ALLOWED_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (allowed?.length && !allowed.includes(user.email.toLowerCase()))
    return { error: 403, message: "Tu cuenta no tiene acceso a Studio." };
  return { user };
}
