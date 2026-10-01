# 2026-10-01_031 — Schema: entidades conectadas, migas de pan y Service por página

**Backlog:** W-125
**Fase:** 6
**Reporte esperado:** `reports/2026-10-01_031_schema-entidades.md`

## Contexto

Stuart sale el 9 de octubre. Hoy el template emite dos JSON-LD: un `InsuranceAgency` suelto en
todas las páginas (`BaseLayout.astro`, `structuredData`) y un `FAQPage` en las páginas con
`:::faq` (`faqPageJsonLd` en `packages/template/src/lib/site-data.mjs`). Al `InsuranceAgency` le
faltan `url`, `logo` e identificador, y nada lo conecta con la agencia real detrás del sitio.

Pavel (SEO) revisó y pidió, para el lanzamiento, un schema "limpio y enfocado":

- la agencia del micrositio con URL, logo, teléfono, correo y área de servicio;
- Walker Insurance Agency como la agencia asociada;
- `BreadcrumbList` en las páginas internas;
- `Service` solo en las páginas que representan un servicio concreto, decidido página por página;
- `FAQPage` como está: solo donde las preguntas son visibles;
- relaciones consistentes entre entidades, sin entidades duplicadas.

El principio del proyecto no cambia: el schema se **genera** desde el config y el contenido.
Nadie escribe JSON-LD a mano, y Studio no tendrá un editor de schema. Lo único que el operador
decide es qué páginas son un servicio, con un campo de frontmatter.

## Objetivo

Cada página de cada sitio emite un JSON-LD con `@graph` cuyas entidades se referencian por
`@id`, sin duplicados, generado solo con datos que ya existen en `site.config.json` y en el
frontmatter. Stuart queda con Walker Insurance Agency como agencia asociada.

## Restricciones

- Todo lo construido en inglés (código, comentarios, mensajes, nombres).
- No toques `apps/studio/` ni `apps/lead-api/`. El campo en Studio lo hace cowork después.
- No cambies nada visible en las páginas. Esto es solo `<script type="application/ld+json">`.
- El schema solo describe lo que existe: sin `aggregateRating`, `review`, `priceRange`,
  `openingHours`, `sameAs` ni `geo`. No inventes datos que no estén en el config o el contenido.
- No agregues dependencias.
- Las URLs del schema usan el dominio real del sitio, igual que el canonical
  (`https://${site.domain}`), también en workers.dev y en previews.
- Conserva el escape de `<` que ya se usa (`.replace(/</g, "\\u003c")`).
- `sites/stuart-homeowners/content/` no se toca: Pavel está por editar esas páginas en Studio.

## Pasos

1. **Config, agencia asociada.** En `packages/config-schema/site.config.schema.json` agrega una
   propiedad opcional de primer nivel `agency` (la agencia con licencia detrás del micrositio):
   `name` (requerido), `url` (requerido, `https://`), `telephone` (opcional, E.164) y `address`
   opcional con `street`, `city`, `state`, `zip`. `additionalProperties: false`, con
   descripciones como el resto del schema. Actualiza los ejemplos de
   `packages/config-schema/examples/` y los tipos si `check:types` lo pide.

2. **Frontmatter.** En `packages/template/src/content.config.ts` agrega `serviceName` opcional
   (`z.string().min(2).max(80)`). Es el nombre del servicio que la página representa, por
   ejemplo "Flood Insurance". Sin ese campo la página no es un servicio.

3. **Constructor del grafo.** En `packages/template/src/lib/site-data.mjs` agrega una función
   pura y exportada (por ejemplo `siteGraphJsonLd`) que reciba el config del sitio y los datos
   de la página, y devuelva el string JSON-LD. Un solo objeto con `@context` y `@graph`:

   - **`WebSite`**: `@id` `https://<domain>/#website`, `url`, `name` (brand.name), `inLanguage`
     (locale primario), `publisher` → `{ "@id": ".../#agency" }`.
   - **`InsuranceAgency`** (el micrositio): `@id` `https://<domain>/#agency`, `name`, `url`,
     `telephone` (trackingPhone), `email`, `areaServed` (geo.serviceArea, si existe), `address`
     si el config la trae (como hoy), `logo` con la URL absoluta de `brand.logo` si existe, y
     `parentOrganization` → `{ "@id": <id de la agencia asociada> }` solo si hay `agency`.
   - **Agencia asociada** (solo si el config trae `agency`): `@type` `InsuranceAgency`, `@id`
     `<agency.url sin slash final>/#organization`, `name`, `url`, y `telephone` y `address` si
     existen.
   - **`BreadcrumbList`** en toda página que no sea la portada: `@id` `<url de la página>#breadcrumb`,
     con `Home` (la portada del mismo idioma) y la página actual. El nombre de la página es
     `navLabel` si existe y si no `title`. Las posiciones empiezan en 1. Debe dar URLs correctas
     en las páginas del idioma alterno del fixture `_example` (carpeta `es/`).
   - **`Service`** solo si la página tiene `serviceName`: `@id` `<url de la página>#service`,
     `name` y `serviceType` = `serviceName`, `url` = la URL de la página, `description` = la
     descripción de la página si existe, `provider` → `{ "@id": ".../#agency" }`, `areaServed`
     igual que la agencia.

   Omite las claves sin valor en vez de emitir `null` o cadenas vacías.

4. **Layout.** En `BaseLayout.astro` reemplaza el `structuredData` actual por la salida de esa
   función. El `FAQPage` se queda como script aparte, sin cambios. Pasa al layout lo que haga
   falta desde las páginas (`title`, `description`, `navLabel`, `serviceName`, la ruta).

5. **Datos.**
   - `sites/stuart-homeowners/site.config.json`: agrega
     `"agency": { "name": "Walker Insurance Agency", "url": "https://www.walkerinsuranceagency.com/", "telephone": "+14079777100", "address": { "street": "789 SW Federal Highway, Suite 201", "city": "Stuart", "state": "FL", "zip": "34994" } }`.
   - `sites/_example/site.config.json`: agrega un `agency` de ficción con dominio `.invalid`.
   - `sites/_example/content/coverage-fixture.md`: agrega `serviceName: Fixture coverage`.
     Ninguna otra página del fixture lleva `serviceName`.

6. **Gate de producción.** Confirma que `scripts/check-production-config.mjs` sigue recorriendo
   el config completo, de modo que un `agency` con placeholder también bloquee. Si hace falta,
   agrega el caso a `scripts/check-production-config.test.mjs`.

7. **Prueba permanente.** Agrega `scripts/schema.test.mjs` a `npm run check`. Construye
   `_example` y `stuart-homeowners` y comprueba sobre el HTML generado:
   - el JSON-LD de cada página revisada es JSON válido y no contiene `<` sin escapar;
   - cada `{ "@id": ... }` que solo referencia apunta a una entidad definida en el mismo grafo;
   - ningún `@id` aparece definido dos veces en una página;
   - la portada no tiene `BreadcrumbList`; una página interna sí, con 2 elementos y URLs absolutas
     del dominio real;
   - `coverage-fixture` tiene `Service` con `provider` a `#agency`; `about-fixture` no tiene `Service`;
   - una página en `es/` del fixture tiene migas con las rutas de ese idioma;
   - Stuart: la agencia tiene `url`, `logo` absoluto y `parentOrganization` a Walker, y Walker
     trae nombre, URL, teléfono y dirección;
   - un sitio sin `agency` en el config (prueba la función directamente) no emite
     `parentOrganization` ni la entidad asociada;
   - el `FAQPage` de `blocks-fixture` sigue saliendo igual.

8. `npm run check` en verde. Commit, push y espera a que **Publish site Workers** termine.

## Criterio de aceptación

- [ ] Un solo `@graph` por página, con `WebSite`, `InsuranceAgency` y, según el caso, la agencia
      asociada, `BreadcrumbList` y `Service`, enlazados por `@id`.
- [ ] Ningún `@id` duplicado ni referencia colgando.
- [ ] `Service` solo donde hay `serviceName`.
- [ ] Sin cambios visibles en las páginas.
- [ ] `npm run check` verde con la prueba nueva.
- [ ] Publish site Workers verde.

## Formato del reporte

Escribe `reports/2026-10-01_031_schema-entidades.md` con las secciones de `prompts/TEMPLATE.md`.
En **Verificación** pega, completos y con formato, el JSON-LD de:

1. la portada de Stuart;
2. `/flood-insurance/` de Stuart (sin `Service`, porque aún no tiene `serviceName`);
3. `/coverage-fixture/` de `_example` (con `Service`).

Pavel los va a comparar contra su referencia y los va a pasar por el Rich Results Test.

## Commit message

```
feat(template): connected schema graph, breadcrumbs and per-page Service (W-125)
```
