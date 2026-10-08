# 2026-10-08_039 — Política de privacidad de Stuart: versión maestra de Kevin, con el nombre legal

**Backlog:** W-131 (páginas legales)
**Fase:** 3 (lanzamiento de Stuart, 9 de octubre)
**Reporte esperado:** `reports/2026-10-08_039_politica-nombre-legal.md`

## Contexto

La política de privacidad de Stuart se creó en Studio el 7-oct y ya está en `main`
(`sites/stuart-homeowners/content/privacy-policy.md`). El 8-oct Kevin la revisó y mandó una versión
maestra para todos los sitios, porque la actual se queda corta frente a lo que la agencia hace
(aseguradoras y MGAs, Google Ads, NowCerts, asistentes virtuales, llamadas y textos con IA, archivos
que se conservan con el registro). Kevin también fijó dos datos:

- El negocio se nombra solo como **Walker Insurance of Central FL Inc.**
- El contacto de privacidad es el de Stuart: `info@stuarthomeownersinsurance.com` y `(772) 247-0106`.

Cowork ya adaptó la versión maestra con esos dos datos. El cuerpo exacto está en
`prompts/2026-10-08_039_privacy-policy-body.md` (sin frontmatter).

El cambio va directo a `main` y no por Studio a propósito: el borrador `draft/stuart-homeowners`
tiene trabajo de Pavel a medias y la política no puede esperar a que ese borrador se publique. Este
cambio no toca ningún archivo que Pavel esté editando. No toques la rama `draft/stuart-homeowners`.

## Qué hacer

1. Trae `main` al día con `origin/main` antes de cualquier cambio (la página se creó desde Studio y
   tu copia local puede no tenerla).
2. En `sites/stuart-homeowners/content/privacy-policy.md`:
   - Conserva el frontmatter tal cual (`title`, `showInNav: false`, `pageType: content`), salvo
     `description`, que queda exactamente:
     `"How Walker Insurance of Central FL Inc. collects, uses, shares and protects the information you submit through this website and its quote form."`
   - Reemplaza **todo** el cuerpo (lo que va después del frontmatter) por el contenido exacto de
     `prompts/2026-10-08_039_privacy-policy-body.md`, byte por byte. No lo reescribas, no lo
     resumas, no cambies puntuación.
3. No toques ningún otro archivo del sitio, `site.config.json`, el template ni el formulario. El
   aviso bajo el formulario de cotización es otro prompt.

## Verificación

1. Compara el cuerpo nuevo contra `prompts/2026-10-08_039_privacy-policy-body.md` (por ejemplo,
   quitando el frontmatter y usando `diff`) y pega la salida vacía en el reporte.
2. `grep -n "Walker Insurance Agency\|\[" sites/stuart-homeowners/content/privacy-policy.md` no
   devuelve nada. Pega la salida.
3. `npm run check` en verde.
4. `node scripts/check-production-config.mjs stuart-homeowners` pasa. Pega la salida.
5. Push a `main` y espera **todos** los workflows que dispare. Anota cada uno con su id y conclusión.
6. Cuando Publish site Workers termine, confirma que
   `https://wicfl-stuart-homeowners-published.wicfl-microsites.workers.dev/privacy-policy/` responde
   200 y muestra "Effective date: October 9, 2026", "Walker Insurance of Central FL Inc." y la
   sección "15. Contact us" con el teléfono y el correo de Stuart.

## Commit

`content(stuart-homeowners): privacy policy replaced with Kevin's master version`, con las líneas de
atribución de `CLAUDE.md`. Incluye en el commit este prompt y el archivo del cuerpo.
