# 2026-10-05_036 — El gate de producción cierra tres huecos: descripción interna, páginas de prueba y política de privacidad

**Backlog:** W-103 (gate de producción), W-131 (páginas legales)
**Fase:** 3 (lanzamiento de Stuart, 9 de octubre)
**Reporte esperado:** `reports/2026-10-05_036_gate-huecos-lanzamiento.md`

## Contexto

`scripts/check-production-config.mjs` es lo único que impide que un sitio con datos de demo
llegue al dominio real: `deploy.yml` lo corre antes de desplegar a producción y falla si hay
hallazgos. Hoy, sobre `sites/stuart-homeowners/`, reporta exactamente cuatro cosas (brand.name,
seo.title, seo.primaryKeyword y un secondaryKeyword con "demo"). Pavel las va a corregir en
Studio esta semana, y entonces el gate dirá "limpio" sobre un sitio que todavía tendría tres
problemas que sí saldrían en vivo el viernes:

1. **`seo.description` dice "Internal preview of the Stuart, Florida homeowners insurance
   microsite template. Not published content and not insurance advice..."** Es la meta
   description que Google mostraría. No contiene la palabra "demo", así que el patrón actual no
   la ve.
2. **Dos páginas de prueba, `content/about-demo.md` y `content/coverage-demo.md`**, con
   `showInNav: false`. No aparecen en el menú, pero se construyen, se sirven en `/about-demo/`
   y `/coverage-demo/`, y entran al `sitemap.xml`. El runbook (precondición 7) le pide a Pavel
   borrarlas a mano; el gate no las detecta porque solo busca imágenes de muestra y texto de
   arranque en el contenido.
3. **No existe `content/privacy-policy.md`.** El formulario de cotización captura nombre,
   teléfono, correo, dirección de la propiedad y una declaración de póliza (PDF/imagen a R2), y
   el sitio carga GA4/GTM en el dominio real. El runbook (precondición 8) dice que el sitio no
   se lanza sin política de privacidad, pero nada lo verifica. El footer
   (`packages/template/src/layouts/BaseLayout.astro`) ya enlaza la página si existe con el id
   `privacy-policy`.

El principio del gate (ver el encabezado del script) es que **un error humano no puede llegar a
producción**. Estos tres son exactamente eso.

Studio tiene una copia de las mismas reglas (`apps/studio/src/siteconfig.js`, `BLOCKERS`, y
`starterBlockers` en `apps/studio/src/sites.js`) para mostrar "Before this site can go live".
**No la toques:** Studio es código de cowork y cowork la alinea en un cambio aparte después de
este prompt. Tu trabajo es el script y sus pruebas.

## Objetivo

Que `node scripts/check-production-config.mjs stuart-homeowners` siga fallando después de que
Pavel quite los cuatro "demo", hasta que además (a) la descripción SEO sea real, (b) no queden
páginas de prueba y (c) exista una política de privacidad real. Y que un sitio limpio pase.

## Restricciones

- Solo `scripts/check-production-config.mjs` y `scripts/check-production-config.test.mjs`.
  Nada en `sites/`, `apps/studio/`, `packages/template/` ni `.github/workflows/`.
- **No corras `prompts/2026-10-02_033_deploy-automatico-produccion.md`** ni toques `deploy.yml`.
- No borres las páginas de prueba de Stuart: eso lo hace Pavel desde Studio y es parte de su
  lista. El gate solo las detecta.
- Los sitios cuyo directorio empieza con `_` siguen exentos, como hoy.
- Mensajes de error en inglés, como los que ya tiene el script.
- `npm run check` no puede necesitar navegador (regla desde `7185cb6`).

## Pasos

1. **Marcadores internos en los campos visibles.** Al patrón "demo marker" (hoy limitado a
   `brand.name` y `seo.*`) agrégale, con el mismo alcance, estos patrones, cada uno con su nombre:
   - `/\binternal\b/i` → "internal marker" (atrapa "Internal Demo" e "Internal preview");
   - `/\bnot published\b/i` → "unpublished-content marker";
   - `/\btemplate preview\b|\bmicrosite template\b/i` → "template marker".
   Con esto, `seo.description` de Stuart cae hoy con dos de ellos. No amplíes "demo" a todo el
   config: `differentiation.localProof[].summary` lo usa legítimamente para describir historia
   y no se renderiza (verifícalo con `grep -rn differentiation packages/template/src`).

2. **Páginas de prueba.** En el recorrido de `content/**/*.md`, lee el frontmatter (sin librería
   nueva: el bloque entre los dos primeros `---`) y marca como `test page` cualquier archivo
   donde se cumpla al menos uno:
   - el nombre del archivo (sin `.md`) contiene `demo`, `test`, `sample`, `fixture` o
     `placeholder` como palabra o separada por guiones (`about-demo`, `coverage-demo`,
     `test-page`, `my-fixture`); `index.md` nunca;
   - `title` o `description` del frontmatter contienen `\bdemo\b`, `\bplaceholder\b`,
     `\btest page\b` o `\binternal preview\b` (sin distinguir mayúsculas).
   El mensaje debe decir la ruta y que la página se serviría y entraría al sitemap, por ejemplo:
   `content/about-demo.md: looks like a test page (it would go live and into the sitemap); delete it in Studio`.

3. **Política de privacidad obligatoria.** El gate falla si no existe
   `content/privacy-policy.md`, o si existe pero (a) no tiene `title` en el frontmatter, (b) tiene
   menos de 1,500 caracteres de cuerpo después del frontmatter, o (c) cae en "starter text" o
   "test page" por los pasos anteriores. Mensaje:
   `content/privacy-policy.md: missing. The quote form collects personal data, so the site cannot go live without a Privacy Policy page (title exactly "Privacy Policy", created in Studio).`
   Terms of Use y Disclaimer **no** son obligatorias en este prompt: siguen siendo deseables y
   el footer las enlaza cuando existan.

4. **Pruebas.** En `scripts/check-production-config.test.mjs` agrega casos para: descripción
   interna en `seo.description` (falla) y la misma frase en `differentiation` (pasa); un archivo
   `about-demo.md` (falla), un `coverage-demo.md` con `description: "Placeholder ..."` (falla),
   un `index.md` cuyo cuerpo mencione "demo" en una frase normal (pasa); sitio sin
   `privacy-policy.md` (falla), con una de 200 caracteres (falla), con una real de más de 1,500
   (pasa). Ajusta el helper `config()` y los casos existentes para que los sitios "limpios" de
   las pruebas incluyan una política válida; no borres ningún caso existente.

5. Corre `npm run check` completo y pega su salida en el reporte. Corre también
   `node scripts/check-production-config.mjs stuart-homeowners` y pega la salida: hoy debe
   listar los cuatro "demo" de siempre **más** la descripción interna, las dos páginas de prueba
   y la política ausente.

6. Commit, push, y espera **todos** los workflows que dispare el push. Como el cambio toca
   `scripts/**`, se disparan "Validate and build" y "Publish site Workers". Lista cada run con
   su id y conclusión. Si alguno queda en rojo, no lo des por terminado: arréglalo o repórtalo
   como fallido.

## Criterio de aceptación

- [ ] `node scripts/check-production-config.mjs stuart-homeowners` reporta hoy, además de los
      cuatro "demo", la descripción interna, `about-demo.md`, `coverage-demo.md` y la política
      de privacidad ausente.
- [ ] `node scripts/check-production-config.mjs _example` sigue saliendo en 0 (exento).
- [ ] Todas las pruebas de `scripts/check-production-config.test.mjs` pasan dentro de
      `npm run check`, sin navegador.
- [ ] "Validate and build" y "Publish site Workers" en verde en el commit del push.
- [ ] Ningún archivo fuera de `scripts/` y `reports/` cambió (más `BITACORA.md` y `BACKLOG.md`
      si registras tu entrada y el avance de W-103, como permite `CLAUDE.md`, regla 10).

## Formato del reporte

Escribe `reports/2026-10-05_036_gate-huecos-lanzamiento.md` con:

- **Qué se hizo** — lista de cambios concretos
- **Decisiones tomadas** — cualquier bifurcación que resolviste y por qué
- **Verificación** — cómo comprobaste que funciona, con output real (los dos comandos del
  paso 5 y la lista de workflows del paso 6)
- **Lo que tocaste fuera de lo pedido** — con la razón. Si no hubo, dilo explícitamente
- **Lo que no pudiste verificar**
- **Dónde dudaste**
- **Qué te sorprendió del repo**
- **Lo que no se hizo** — y por qué
- **Próximos pasos sugeridos**
- **Commits** — hashes y mensajes

*(Cowork agrega al final una sección `## Revisión de cowork` con su veredicto. No la escribas tú.)*

## Commit message

```
fix(gate): production check also rejects internal SEO copy, test pages and a missing privacy policy

Refs W-103, W-131
```
