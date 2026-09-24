# Accounts and access

Once domains, DNS, hosting and SSL all live in one Cloudflare account, that account **is**
the business asset. Getting it right on day one takes thirty minutes. Fixing it after
twenty domains is a migration.

| Rule | Why it matters |
|---|---|
| Account created under a **company email**, never a personal one | An account created under a contractor's personal email means WICFL's entire digital asset base sits legally with that contractor. Adding admins later does not fix this. |
| **Two Super Administrators**, Kevin plus one | A single holder means one lost 2FA device locks out the whole portfolio. Expired domains are the one failure we cannot undo. |
| Pavel holds **Administrator**, not Super Administrator | Full operational access without the ability to move domains or touch billing. |
| 2FA on, **recovery codes in a shared company vault** | The codes cannot live in one person's drawer. |
| Automation uses **scoped API tokens**, never the Global API Key | A leaked global key is total account compromise. A scoped token is a contained one. |
| Company card on file, **auto renew enabled everywhere** | A card expiring mid year with renewal notices going to an unwatched inbox is the most common way portfolios die quietly. |

## Cloudflare roles reference

- **Super Administrator** — everything, including billing, domain transfers, nameserver
  changes and member management
- **Administrator** — full account operation, but cannot touch billing or members
- Multi member access works on the free plan. Configure at Manage Account → Members.

## Two failure modes these rules address

They are different problems and both need solving:

1. **Lockout.** A second admin means someone can always get in.
2. **Ownership.** The account owner email determines who the asset legally belongs to.
   No number of added admins changes that. It has to be right at creation.

## WICFL Studio access (added 23 Sep 2026)

Studio (`https://wicfl-studio.wicfl-microsites.workers.dev`) is protected by **Cloudflare Access**
on the free Zero Trust plan, inside the same Cloudflare account.

| Piece | Setting |
|---|---|
| Zero Trust team | `flat-rain-592f` (login page `flat-rain-592f.cloudflareaccess.com`). **Renaming it breaks Studio's sign-in check** until `ACCESS_TEAM_DOMAIN` in `apps/studio/wrangler.jsonc` is updated to match |
| Login method | **One-time PIN** only: a code sent to the person's email. The "Cloudflare account" login is switched off for this app |
| Policy | Reusable policy **Studio - Team**, action Allow, rule "Emails": Victor's and Pavel's addresses. Session length is set on this policy |
| Scope | All traffic on the Worker, including its `workers.dev` hostname and previews |
| Second check | The Worker also requires the email to be in `ALLOWED_EMAILS`, so if Access were ever switched off by mistake nobody else gets in |

To give or remove access, change the emails in **both** places: the **Studio - Team** policy
(Cloudflare One → Access controls → Policies) and the GitHub secret `STUDIO_ALLOWED_EMAILS`,
then rerun the "Deploy WICFL Studio" workflow.

**GitHub side.** The repository belongs to the personal GitHub account `microsites-wicfl`
(`microsites@wicfl.com`), so only that account can create tokens for it and manage its secrets.
Studio uses a fine-grained token owned by that account, limited to this one repository:
Contents read/write, Pull requests read/write, Actions read-only (fine-grained tokens do not
offer "Checks", so Studio reads preview status through Actions). It is stored as the secret
`STUDIO_GITHUB_TOKEN`; the deploy workflow copies it into the Worker. When the token expires,
create a new one with the same permissions, replace the secret, and rerun the workflow.

