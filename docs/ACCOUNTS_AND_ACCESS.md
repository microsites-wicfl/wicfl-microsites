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
